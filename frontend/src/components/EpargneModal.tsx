import { useState } from 'react'
import { FaChartLine, FaSpinner, FaTimes } from 'react-icons/fa'
import { CompteBancaire } from '../utils/types'
import { toast } from 'react-toastify'
import { epargne_action } from '../services/actions'

interface EpargneModalProps {
  accounts: CompteBancaire[]
  onClose: () => void
  onSuccess: () => void
}

export default function EpargneModal({ accounts, onClose, onSuccess }: EpargneModalProps) {
  const [sourceAccountId, setSourceAccountId] = useState('')
  const [destinationAccountId, setDestinationAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtrer les comptes courants et d'épargne
  const comptesSource = accounts.filter(account => account.statut === 'approuve')
  const comptesEpargne = accounts.filter(account => 
    account.statut === 'approuve' && account.type_compte === 'epargne'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!sourceAccountId || !destinationAccountId || !amount) {
      setError('Tous les champs sont requis')
      setLoading(false)
      return
    }

    if (sourceAccountId === destinationAccountId) {
      setError('Le compte source et le compte d\'épargne ne peuvent pas être identiques')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('compte', sourceAccountId)
      formData.append('montant', amount)
      formData.append('compte_epargne', destinationAccountId)

      const result = await epargne_action({
        request: new Request('', {
          method: 'POST',
          body: formData,
        }),
      })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success('Opération d\'épargne effectuée avec succès')
        onSuccess()
        onClose()
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de l\'opération d\'épargne'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-lime-900 bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-lime-900 p-4">
          <h2 className="text-xl font-semibold text-amber-100">Opération d'Épargne</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-[#1a3019] hover:text-lime-400"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-900 bg-opacity-20 p-3 text-red-200">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="source-account" className="mb-1 block text-sm font-medium text-amber-100">
              Compte source
            </label>
            <select
              id="source-account"
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
              required
            >
              <option value="">Sélectionner un compte</option>
              {comptesSource.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.type_compte === 'courant' ? 'Compte Courant' : 'Compte Épargne'} (••••
                  {account.numero_compte.slice(-4)}) - {new Intl.NumberFormat('fr-MG', {
                    style: 'currency',
                    currency: 'MGA',
                  }).format(account.solde)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="destination-account" className="mb-1 block text-sm font-medium text-amber-100">
              Compte d'épargne destinataire
            </label>
            <select
              id="destination-account"
              value={destinationAccountId}
              onChange={(e) => setDestinationAccountId(e.target.value)}
              className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
              required
            >
              <option value="">Sélectionner un compte d'épargne</option>
              {comptesEpargne.map((account) => (
                <option key={account.id} value={account.id}>
                  Compte Épargne (••••{account.numero_compte.slice(-4)}) - {new Intl.NumberFormat('fr-MG', {
                    style: 'currency',
                    currency: 'MGA',
                  }).format(account.solde)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-amber-100">
              Montant (MGA)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
              className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 rounded-lg border border-lime-900 bg-transparent px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-[#1a3019] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-[#031a09]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center rounded-lg bg-[#294e28] px-4 py-2 text-sm font-medium text-lime-400 transition hover:bg-[#1a3019] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-[#031a09] disabled:opacity-50"
            >
              {loading ? (
                <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FaChartLine className="mr-2 h-4 w-4" />
              )}
              Épargner
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}