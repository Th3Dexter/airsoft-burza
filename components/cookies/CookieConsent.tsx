'use client'

import { useEffect, useState } from 'react'

type ConsentCategories = {
	necessary: boolean
	analytics: boolean
	marketing: boolean
}

const COOKIE_NAME = 'cookie-consent'
const COOKIE_MAX_AGE_DAYS = 180

function setConsentCookie(value: ConsentCategories) {
	const expires = new Date()
	expires.setDate(expires.getDate() + COOKIE_MAX_AGE_DAYS)
	document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; path=/; expires=${expires.toUTCString()}; SameSite=Lax` 
}

function getConsentCookie(): ConsentCategories | null {
	if (typeof document === 'undefined') return null
	const match = document.cookie.split('; ').find(c => c.startsWith(`${COOKIE_NAME}=`))
	if (!match) return null
	try {
		return JSON.parse(decodeURIComponent(match.split('=')[1]))
	} catch {
		return null
	}
}

export function CookieConsent() {
	const [isOpen, setIsOpen] = useState(false)
	const [showCustomize, setShowCustomize] = useState(false)
	const [consent, setConsent] = useState<ConsentCategories>({
		necessary: true,
		analytics: false,
		marketing: false,
	})

	useEffect(() => {
		const existing = getConsentCookie()
		if (!existing) {
			setIsOpen(true)
		} else {
			setConsent(existing)
		}
	}, [])

	const acceptAll = () => {
		const all = { necessary: true, analytics: true, marketing: true }
		setConsent(all)
		setConsentCookie(all)
		setIsOpen(false)
		// Zajistit, že banner se skutečně odstraní z DOM
		setTimeout(() => {
			setIsOpen(false)
		}, 100)
	}

	const rejectNonEssential = () => {
		const onlyNecessary = { necessary: true, analytics: false, marketing: false }
		setConsent(onlyNecessary)
		setConsentCookie(onlyNecessary)
		setIsOpen(false)
		// Zajistit, že banner se skutečně odstraní z DOM
		setTimeout(() => {
			setIsOpen(false)
		}, 100)
	}

	const saveCustom = () => {
		const value = { ...consent, necessary: true }
		setConsentCookie(value)
		setIsOpen(false)
		// Zajistit, že banner se skutečně odstraní z DOM
		setTimeout(() => {
			setIsOpen(false)
		}, 100)
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-x-0 bottom-0 z-50">
			<div className="mx-auto max-w-5xl m-4 rounded-lg border-2 border-border bg-card shadow-lg">
				<div className="p-4">
					<h2 className="text-lg font-semibold text-foreground mb-2">Používáme cookies</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Abychom vylepšili váš zážitek, používáme cookies. Nezbytné jsou nutné pro fungování webu. Můžete přijmout všechny, odmítnout nepodstatné nebo si vybrat vlastní nastavení.
					</p>

					{showCustomize && (
						<div className="mb-4 space-y-3">
							<label className="flex items-center justify-between">
								<span className="text-sm text-foreground">Nezbytné</span>
								<input type="checkbox" checked readOnly className="h-4 w-4" />
							</label>
							<label className="flex items-center justify-between">
								<span className="text-sm text-foreground">Analytické</span>
								<input
									type="checkbox"
									checked={consent.analytics}
									onChange={(e) => setConsent(c => ({ ...c, analytics: e.target.checked }))}
									className="h-4 w-4"
								/>
							</label>
							<label className="flex items-center justify-between">
								<span className="text-sm text-foreground">Marketingové</span>
								<input
									type="checkbox"
									checked={consent.marketing}
									onChange={(e) => setConsent(c => ({ ...c, marketing: e.target.checked }))}
									className="h-4 w-4"
								/>
							</label>
						</div>
					)}

					<div className="flex flex-wrap gap-2 justify-end">
						<button onClick={() => setShowCustomize(s => !s)} className="px-3 py-2 text-sm border-2 border-border rounded">
							{showCustomize ? 'Skrýt nastavení' : 'Vlastní nastavení'}
						</button>
						<button onClick={rejectNonEssential} className="px-3 py-2 text-sm border-2 border-border rounded">
							Odmítnout nepodstatné
						</button>
						<button onClick={acceptAll} className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded">
							Přijmout vše
						</button>
						{showCustomize && (
							<button onClick={saveCustom} className="px-3 py-2 text-sm bg-foreground text-background rounded">
								Uložit výběr
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}




