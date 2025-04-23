import { useEffect, useState } from 'react'
import {
  FaBell,
  FaChartLine,
  FaHandHoldingUsd,
  FaPlus,
  FaRegCreditCard,
  FaRegMoneyBillAlt,
  FaTimes,
  FaWallet,
} from 'react-icons/fa'
import { CompteBancaire } from '../utils/types'
import {
  create_account_action,
  fetch_accounts_action,
  loan_request_action,
  mobile_money_transaction_action,
} from '../services/actions'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MobileMoneyModal from '../components/MobileMoneyModal'

export default function Dashboard() {
  const [accounts, setAccounts] = useState<CompteBancaire[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewAccountModal, setShowNewAccountModal] = useState(false)
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New state variable for Mobile Money modal
  const [showMobileMoneyModal, setShowMobileMoneyModal] = useState(false)

  // États pour le formulaire de création de compte
  const [accountType, setAccountType] = useState<'courant' | 'epargne'>('courant')
  const [employmentProof, setEmploymentProof] = useState<File | null>(null)

  // États pour le formulaire de demande de prêt
  const [loanAmount, setLoanAmount] = useState('')
  const [loanReason, setLoanReason] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')

  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await fetch_accounts_action()
        if (data.error) {
          setError(data.error)
        } else {
          setAccounts(data)
        }
      } catch (err) {
        setError('Impossible de charger vos comptes')
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [])

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('type_compte', accountType)
    if (employmentProof) {
      formData.append('justificatif_emploi', employmentProof)
    }

    try {
      const data = await create_account_action({
        request: new Request('', {
          method: 'POST',
          body: formData,
        }),
      })

      if (data.error) {
        setError(data.error)
      } else {
        setAccounts((prev) => [...prev, data])
        setShowNewAccountModal(false)
        resetAccountForm()
      }
    } catch (err) {
      setError('Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const handleLoanRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!selectedAccount) {
      setError('Veuillez sélectionner un compte')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('compte', selectedAccount)
      formData.append('montant', loanAmount)
      formData.append('motif', loanReason)

      console.log('Submitting loan request:', {
        compte: selectedAccount,
        montant: loanAmount,
        motif: loanReason,
      })

      const data = await loan_request_action({
        request: new Request('', {
          method: 'POST',
          body: formData,
        }),
      })

      if (data.error) {
        setError(data.error)
      } else {
        setShowLoanModal(false)
        resetLoanForm()
        // Show success message
        toast.success('Demande de prêt envoyée avec succès')
        // Refresh accounts to show updated balances
        const updatedAccounts = await fetch_accounts_action()
        if (!updatedAccounts.error) {
          setAccounts(updatedAccounts)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la demande de prêt')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEmploymentProof(e.target.files[0])
    }
  }

  const resetAccountForm = () => {
    setAccountType('courant')
    setEmploymentProof(null)
  }

  const resetLoanForm = () => {
    setSelectedAccount('')
    setLoanAmount('')
    setLoanReason('')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approuve':
        return 'bg-lime-100 text-lime-800'
      case 'en_attente':
        return 'bg-amber-100 text-amber-800'
      case 'rejete':
        return 'bg-rose-100 text-rose-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approuve':
        return 'Approuvé'
      case 'en_attente':
        return 'En attente'
      case 'rejete':
        return 'Rejeté'
      default:
        return status
    }
  }

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'courant':
        return 'Compte Courant'
      case 'epargne':
        return 'Compte Épargne'
      default:
        return type
    }
  }

  const getAccountIcon = (type: string) => {
    return type === 'courant' ? (
      <FaRegMoneyBillAlt className="h-8 w-8 text-lime-400" />
    ) : (
      <FaRegCreditCard className="h-8 w-8 text-amber-100" />
    )
  }

  // New handler for Mobile Money transactions
  const handleMobileMoneyTransaction = async (data: {
    accountId: string
    amount: string
    transactionType: 'depot' | 'retrait'
    mobileMoneyProvider: 'mvola' | 'orange_money'
    phoneNumber: string
  }) => {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('compte', data.accountId)
    formData.append('montant', data.amount)
    formData.append('type_transaction', data.transactionType)
    formData.append('fournisseur', data.mobileMoneyProvider)
    formData.append('numero_telephone', data.phoneNumber)

    try {
      const result = await mobile_money_transaction_action({
        request: new Request('', {
          method: 'POST',
          body: formData,
        }),
      })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(
          `${data.transactionType === 'depot' ? 'Dépôt' : 'Retrait'} effectué avec succès`,
        )
        // Refresh accounts to show updated balances
        const updatedAccounts = await fetch_accounts_action()
        if (!updatedAccounts.error) {
          setAccounts(updatedAccounts)
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la transaction'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#031a09] p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-lime-400">Tableau de bord</h1>
        <p className="mt-2 text-amber-100">Bienvenue sur votre espace bancaire personnel</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-900 bg-opacity-50 p-4 text-sm text-red-200">
            <div className="flex items-center">
              <FaTimes className="mr-2 h-4 w-4" />
              <p>{error}</p>
            </div>
          </div>
        )}
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#294e28] border-t-lime-400"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Résumé des comptes */}
          <section className="rounded-xl border border-lime-900 bg-gray-800 bg-opacity-30 p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-amber-100">Mes comptes</h2>
              <button
                onClick={() => setShowNewAccountModal(true)}
                className="flex items-center rounded-lg bg-[#294e28] px-4 py-2 text-sm font-medium text-lime-400 transition hover:bg-[#1a3019] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-[#031a09]"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Nouveau compte
              </button>
            </div>

            {accounts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="relative overflow-hidden rounded-xl border border-lime-900 bg-gray-800 bg-opacity-40 p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center">
                        {getAccountIcon(account.type_compte)}
                        <div className="ml-3">
                          <h3 className="font-medium text-amber-100">
                            {getAccountTypeLabel(account.type_compte)}
                          </h3>
                          <p className="text-xs text-gray-300">
                            ••••{account.numero_compte.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                          account.statut,
                        )}`}
                      >
                        {getStatusLabel(account.statut)}
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-lime-400">
                        {formatCurrency(account.solde)}
                      </p>
                      <p className="text-xs text-gray-300">Solde disponible</p>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#294e28] to-lime-400"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-lime-900 bg-gray-800 bg-opacity-20 py-12">
                <FaWallet className="mb-3 h-12 w-12 text-[#294e28]" />
                <h3 className="mb-1 text-lg font-medium text-amber-100">Aucun compte</h3>
                <p className="mb-4 max-w-md text-center text-sm text-gray-300">
                  Vous n'avez pas encore de compte bancaire. Créez votre premier compte pour
                  commencer à gérer vos finances.
                </p>
                <button
                  onClick={() => setShowNewAccountModal(true)}
                  className="flex items-center rounded-lg bg-[#294e28] px-4 py-2 text-sm font-medium text-lime-400 transition hover:bg-[#1a3019] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-[#031a09]"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Créer mon premier compte
                </button>
              </div>
            )}
          </section>

          {/* Actions rapides */}
          <section className="rounded-xl border border-lime-900 bg-gray-800 bg-opacity-30 p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-amber-100">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <button
                onClick={() => accounts.length > 0 && setShowLoanModal(true)}
                disabled={accounts.length === 0}
                className="flex flex-col items-center rounded-xl border border-lime-900 p-6 text-center transition hover:border-lime-700 hover:bg-[#1a3019] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-lime-900 disabled:hover:bg-transparent disabled:hover:shadow-none"
              >
                <FaHandHoldingUsd className="mb-3 h-8 w-8 text-lime-400" />
                <span className="text-sm font-medium text-amber-100">Demander un prêt</span>
              </button>
              <button
                onClick={() => accounts.length > 0 && setShowMobileMoneyModal(true)}
                disabled={accounts.length === 0}
                className="flex flex-col items-center rounded-xl border border-lime-900 p-6 text-center transition hover:border-lime-700 hover:bg-[#1a3019] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-lime-900 disabled:hover:bg-transparent disabled:hover:shadow-none"
              >
                <FaWallet className="mb-3 h-8 w-8 text-lime-400" />
                <span className="text-sm font-medium text-amber-100">Dépôt / Retrait</span>
              </button>
              <button className="flex flex-col items-center rounded-xl border border-lime-900 p-6 text-center transition hover:border-lime-700 hover:bg-[#1a3019] hover:shadow-sm">
                <FaChartLine className="mb-3 h-8 w-8 text-lime-400" />
                <span className="text-sm font-medium text-amber-100">Investissements</span>
              </button>
              <button className="flex flex-col items-center rounded-xl border border-lime-900 p-6 text-center transition hover:border-lime-700 hover:bg-[#1a3019] hover:shadow-sm">
                <FaBell className="mb-3 h-8 w-8 text-lime-400" />
                <span className="text-sm font-medium text-amber-100">Alertes</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Modal de création de compte */}
      {showNewAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl border border-lime-900 bg-[#031a09] shadow-lg">
            <div className="flex items-center justify-between border-b border-lime-900 p-4">
              <h3 className="text-lg font-medium text-lime-400">Créer un nouveau compte</h3>
              <button
                onClick={() => {
                  setShowNewAccountModal(false)
                  resetAccountForm()
                }}
                className="rounded-full p-1 text-gray-400 transition hover:bg-[#1a3019] hover:text-lime-400"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-6">
              <div className="mb-4">
                <label
                  htmlFor="account-type"
                  className="mb-1 block text-sm font-medium text-amber-100"
                >
                  Type de compte
                </label>
                <select
                  id="account-type"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as 'courant' | 'epargne')}
                  className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
                  required
                >
                  <option value="courant">Compte Courant</option>
                  <option value="epargne">Compte Épargne</option>
                </select>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="employment-proof"
                  className="mb-1 block text-sm font-medium text-amber-100"
                >
                  Justificatif d'emploi
                </label>
                <input
                  id="employment-proof"
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 text-white focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">Format PDF ou image, taille max: 5MB</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAccountModal(false)
                    resetAccountForm()
                  }}
                  className="rounded-lg border border-lime-900 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-[#1a3019]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#294e28] px-4 py-2 text-sm font-medium text-lime-400 transition hover:bg-[#1a3019] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-[#031a09]"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de demande de prêt */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl border border-lime-900 bg-[#031a09] shadow-lg">
            <div className="flex items-center justify-between border-b border-lime-900 p-4">
              <h3 className="text-lg font-medium text-lime-400">Demande de prêt</h3>
              <button
                onClick={() => {
                  setShowLoanModal(false)
                  resetLoanForm()
                }}
                className="rounded-full p-1 text-gray-400 transition hover:bg-[#1a3019] hover:text-lime-400"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleLoanRequest} className="p-6">
              <div className="mb-4">
                <label htmlFor="account" className="mb-1 block text-sm font-medium text-amber-100">
                  Compte à créditer
                </label>
                <select
                  id="account"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
                  required
                >
                  <option value="">Sélectionner un compte</option>
                  {accounts
                    .filter((account) => account.statut === 'approuve')
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {getAccountTypeLabel(account.type_compte)} (••••
                        {account.numero_compte.slice(-4)})
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="loan-amount"
                  className="mb-1 block text-sm font-medium text-amber-100"
                >
                  Montant du prêt (MGA)
                </label>
                <input
                  id="loan-amount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
                  required
                  min="1000"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="loan-reason"
                  className="mb-1 block text-sm font-medium text-amber-100"
                >
                  Motif du prêt
                </label>
                <textarea
                  id="loan-reason"
                  value={loanReason}
                  onChange={(e) => setLoanReason(e.target.value)}
                  className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
                  required
                  rows={3}
                  placeholder="Veuillez indiquer le motif de votre demande de prêt"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoanModal(false)
                    resetLoanForm()
                  }}
                  className="rounded-lg border border-lime-900 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-[#1a3019]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#294e28] px-4 py-2 text-sm font-medium text-lime-400 transition hover:bg-[#1a3019] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-[#031a09]"
                >
                  Soumettre la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Money Modal */}
      {showMobileMoneyModal && (
        <MobileMoneyModal
          accounts={accounts}
          onClose={() => setShowMobileMoneyModal(false)}
          onSubmit={handleMobileMoneyTransaction}
        />
      )}
    </div>
  )
}
