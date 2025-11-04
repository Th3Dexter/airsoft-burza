'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useNotifications } from '@/lib/NotificationContext'
import { 
  AlertTriangle, 
  Search,
  ArrowLeft,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  ExternalLink,
  Mail,
  User,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Report {
  id: string
  type: 'BUG' | 'FEATURE' | 'SECURITY' | 'OTHER'
  title: string
  description: string
  email?: string
  url?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  userId?: string
  userName?: string
  userEmail?: string
}

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showSuccess, showError, showConfirmation } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'>('all')
  const [loadingReports, setLoadingReports] = useState(false)

  const loadReports = useCallback(async () => {
    setLoadingReports(true)
    try {
      const response = await fetch('/api/admin/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
        setFilteredReports(data.reports || [])
      }
    } catch (error) {
      console.error('Error loading reports:', error)
      showError('Chyba', 'Nepodařilo se načíst nahlášení')
    } finally {
      setLoadingReports(false)
    }
  }, [showError])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    const userIsAdmin = (session.user as any).isAdmin || false
    setIsAdmin(userIsAdmin)
    
    if (userIsAdmin) {
      loadReports()
    } else {
      router.push('/admin')
    }
    
    setLoading(false)
  }, [session, status, router, loadReports])

  useEffect(() => {
    let filtered = reports

    // Filtrování podle stavu
    if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter)
    }

    // Filtrování podle vyhledávání
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredReports(filtered)
  }, [searchTerm, filter, reports])

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        showSuccess('Úspěch', 'Stav nahlášení byl změněn')
        loadReports()
      } else {
        showError('Chyba', 'Nepodařilo se změnit stav nahlášení')
      }
    } catch (error) {
      showError('Chyba', 'Nepodařilo se změnit stav nahlášení')
    }
  }

  const handleDeleteReport = async (reportId: string, reportTitle: string) => {
    const confirmed = await showConfirmation({
      title: 'Smazat nahlášení?',
      message: `Opravdu chcete smazat nahlášení "${reportTitle}"? Tato akce je nevratná.`,
      confirmText: 'Smazat',
      cancelText: 'Zrušit',
      type: 'danger'
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showSuccess('Úspěch', 'Nahlášení bylo smazáno')
        loadReports()
      } else {
        showError('Chyba', 'Nepodařilo se smazat nahlášení')
      }
    } catch (error) {
      showError('Chyba', 'Nepodařilo se smazat nahlášení')
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: { text: string; color: string; icon: any } } = {
      'PENDING': { text: 'Čeká na řešení', color: 'bg-orange-100 text-orange-800', icon: Clock },
      'IN_PROGRESS': { text: 'V řešení', color: 'bg-blue-100 text-blue-800', icon: Clock },
      'RESOLVED': { text: 'Vyřešeno', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'REJECTED': { text: 'Zamítnuto', color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    return labels[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
  }

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'BUG': 'Chyba',
      'FEATURE': 'Návrh',
      'SECURITY': 'Bezpečnost',
      'OTHER': 'Ostatní'
    }
    return labels[type] || type
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Načítání..." />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8 opacity-80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              Nahlášené problémy
            </h1>
            <p className="text-lg text-muted-foreground">
              Správa a řešení nahlášených problémů od uživatelů
            </p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex items-center gap-4 flex-1">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Hledat nahlášení..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="all">Všechny stavy</option>
                    <option value="PENDING">Čeká na řešení</option>
                    <option value="IN_PROGRESS">V řešení</option>
                    <option value="RESOLVED">Vyřešeno</option>
                    <option value="REJECTED">Zamítnuto</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          {loadingReports ? (
            <LoadingSpinner size="lg" text="Načítání nahlášení..." />
          ) : filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Žádná nahlášení
                </h3>
                <p className="text-muted-foreground">
                  Nebyla nalezena žádná nahlášení odpovídající filtrům
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const statusInfo = getStatusLabel(report.status)
                const StatusIcon = statusInfo.icon

                return (
                  <Card key={report.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-foreground">
                              {report.title}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                              <StatusIcon className="h-3 w-3 inline mr-1" />
                              {statusInfo.text}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              {getTypeLabel(report.type)}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                            {report.description}
                          </p>

                          {/* Metadata */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                            {report.userName && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="font-medium">{report.userName}</span>
                                {report.userEmail && (
                                  <span>({report.userEmail})</span>
                                )}
                              </div>
                            )}
                            {report.email && !report.userName && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {report.email}
                              </div>
                            )}
                            {report.url && (
                              <div className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                <Link 
                                  href={report.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate"
                                >
                                  {report.url}
                                </Link>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(report.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap pt-4 border-t border-border">
                        <Button
                          size="sm"
                          variant={report.status === 'PENDING' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(report.id, 'PENDING')}
                          disabled={report.status === 'PENDING'}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Čeká
                        </Button>
                        <Button
                          size="sm"
                          variant={report.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(report.id, 'IN_PROGRESS')}
                          disabled={report.status === 'IN_PROGRESS'}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          V řešení
                        </Button>
                        <Button
                          size="sm"
                          variant={report.status === 'RESOLVED' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(report.id, 'RESOLVED')}
                          disabled={report.status === 'RESOLVED'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Vyřešeno
                        </Button>
                        <Button
                          size="sm"
                          variant={report.status === 'REJECTED' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(report.id, 'REJECTED')}
                          disabled={report.status === 'REJECTED'}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Zamítnout
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                          onClick={() => handleDeleteReport(report.id, report.title)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Smazat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

