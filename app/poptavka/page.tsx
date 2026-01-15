import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Target, Shield, Package, ArrowRight } from 'lucide-react'

export default function PoptavkaLandingPage() {
	const categories = [
		{ name: 'Airsoft zbraně', href: '/poptavka/airsoft-weapons', icon: Target, description: 'Poptávky zbraní a příslušenství' },
		{ name: 'Military vybavení', href: '/poptavka/military-equipment', icon: Shield, description: 'Poptávky oblečení a výstroje' },
		{ name: 'Ostatní', href: '/poptavka/other', icon: Package, description: 'Poptávky dílů a doplňků' },
	]

	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1 py-8 opacity-80">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-10">
						<h1 className="text-3xl font-bold text-foreground mb-2">Poptávka</h1>
						<p className="text-muted-foreground">Vyberte kategorii poptávky</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{categories.map((c) => {
							const Icon = c.icon
							return (
								<Link key={c.href} href={c.href}>
									<Card className="group hover:shadow-md transition-shadow bg-card border-border">
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-3">
												<div className="p-3 rounded-lg bg-muted">
													<Icon className="h-6 w-6 text-muted-foreground" />
												</div>
												<ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
											</div>
											<h3 className="text-lg font-semibold text-foreground mb-1">{c.name}</h3>
											<p className="text-sm text-muted-foreground">{c.description}</p>
										</CardContent>
									</Card>
								</Link>
							)
						})}
					</div>
				</div>
			</main>
		</div>
	)
}
