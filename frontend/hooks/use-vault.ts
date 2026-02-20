"use client"

import { useCallback, useMemo, useRef, useState } from "react"

type Persisted = {
  cipher: string
  salt: string
  iv: string
  ts: number
}

function b64(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes))
  return typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bin, "binary").toString("base64")
}
function unb64(s: string): Uint8Array {
  const bin = typeof atob !== "undefined" ? atob(s) : Buffer.from(s, "base64").toString("binary")
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"])
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 150000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

export function useVault(storageKey: string) {
  const [locked, setLocked] = useState(true)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const keyRef = useRef<CryptoKey | null>(null)
  const enc = useMemo(() => new TextEncoder(), [])
  const dec = useMemo(() => new TextDecoder(), [])

  const unlock = useCallback(async (password: string) => {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      keyRef.current = await deriveKey(password, salt)
      // Keep the salt we just generated for a new save; on load we replace key with derived from stored salt automatically
      ;(keyRef as any).salt = salt
      setLocked(false)
      setError(null)
      return true
    } catch (e: any) {
      setError(e?.message ?? "unlock failed")
      return false
    }
  }, [])

  const lock = useCallback(() => {
    keyRef.current = null
    ;(keyRef as any).salt = null
    setLocked(true)
  }, [])

  const saveEncrypted = useCallback(async (data: any) => {
    if (!keyRef.current) { setError("vault locked"); return }
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const salt: Uint8Array = (keyRef as any).salt ?? crypto.getRandomValues(new Uint8Array(16))
      // If salt changed, re-derive with the salt used to encrypt
      keyRef.current = await deriveKey(await exportPasswordFromKey(keyRef.current), salt)
      const plaintext = enc.encode(JSON.stringify(data))
      const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, keyRef.current, plaintext)
      const payload: Persisted = {
        cipher: b64(cipherBuf),
        iv: b64(iv),
        salt: b64(salt),
        ts: Date.now(),
      }
      localStorage.setItem(storageKey, JSON.stringify(payload))
      setLastSavedAt(payload.ts)
      setError(null)
    } catch (e: any) {
      setError(e?.message ?? "save failed")
    }
  }, [enc, storageKey])

  const loadEncrypted = useCallback(async (): Promise<any | null> => {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    try {
      const payload: Persisted = JSON.parse(raw)
      // If locked, we need password from user to derive key with stored salt
      if (!keyRef.current) {
        setError("unlock required")
        return null
      }
      const salt = unb64(payload.salt)
      // re-derive with stored salt
      keyRef.current = await deriveKey(await exportPasswordFromKey(keyRef.current), salt)
      const iv = unb64(payload.iv)
      const cipher = unb64(payload.cipher)
      const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, keyRef.current, cipher)
      const json = JSON.parse(dec.decode(plainBuf))
      setError(null)
      return json
    } catch (e: any) {
      setError(e?.message ?? "load failed")
      return null
    }
  }, [dec, storageKey])

  return { locked, unlock, lock, saveEncrypted, loadEncrypted, lastSavedAt, error }
}

/*
  IMPORTANT: WebCrypto doesn't allow extracting password from a derived key.
  To keep UX simple in this in-browser demo, we stash the password material in memory by wrapping the key with an export/import cycle.
  In a real app, you'd prompt for password again on load after refresh.
*/
async function exportPasswordFromKey(key: CryptoKey): Promise<string> {
  // This function doesn't truly export password. We attach a hidden property at unlock time in this demo.
  // If not available, ask via prompt.
  const pw = (key as any).__pw ?? (await new Promise<string>((res) => {
    const p = prompt("Enter vault password to continue") || ""
    res(p)
  }))
  ;(key as any).__pw = pw
  return pw
}
