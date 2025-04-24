import { useState } from 'react'
import { FaExchangeAlt, FaSearch, FaSpinner, FaTimes, FaUser } from 'react-icons/fa'
import { CompteBancaire } from '../utils/types'
import { toast } from 'react-toastify'
import { transfer_money_action, verify_account_action } from '../services/actions'

interface SendMoneyModalProps {
  accounts: CompteBancaire[]
  onClose: () => void
  onSuccess: () => void
}

export default function SendMoneyModal({ accounts, onClose, onSuccess }: SendMoneyModalProps) {
  const [sourceAccountId, setSourceAccountId] = useState('')
  const [destinationAccountNumber, setDestinationAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // État pour stocker les informations du compte destinataire vérifié
  const [verifiedAccount, setVerifiedAccount] = useState<{
    id: string
    numero_compte: string
    nom_proprietaire: string
    prenom_proprietaire: string
  } | null>(null)

  // Fonction pour vérifier le compte destinataire
  const verifyAccount = async () => {
    if (!destinationAccountNumber) {
      setError('Veuillez saisir un numéro de compte')
      return
    }

    setVerifying(true)
    setError(null)

    try {
      const result = await verify_account_action({
        context: undefined,
        params: undefined,
        request: new Request('', {
          method: 'POST',
          body: JSON.stringify({ numero_compte: destinationAccountNumber }),
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      })

      if (result.error) {
        setError(result.error)
        setVerifiedAccount(null)
      } else {
        setVerifiedAccount(result)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification du compte')
      setVerifiedAccount(null)
    } finally {
      setVerifying(false)
    }
  }

  // Fonction pour envoyer de l'argent
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verifiedAccount) {
      setError("Veuillez d'abord vérifier le compte destinataire")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('compte_source', sourceAccountId)
      // Utiliser l'ID du compte vérifié comme compte_destination
      formData.append('compte_destination', verifiedAccount.id)
      formData.append('montant', amount)
      formData.append('description', description)

      // Log pour déboguer
      console.log('Données du formulaire:', {
        compte_source: sourceAccountId,
        compte_destination: verifiedAccount.id,
        montant: amount,
        description: description,
      })

      const result = await transfer_money_action({
        request: new Request('', {
          method: 'POST',
          body: formData,
        }),
        context: undefined,
        params: undefined,
      })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success('Transfert effectué avec succès')
        onSuccess()
        onClose()
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors du transfert'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl border border-lime-900 bg-gray-900 shadow-lg">
        <div className="flex items-center justify-between border-b border-lime-900 p-4">
          <h2 className="text-xl font-semibold text-amber-100">
            <FaExchangeAlt className="mr-2 inline-block h-5 w-5 text-lime-400" />
            Envoyer de l'argent
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-[#1a3019] hover:text-lime-400"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-rose-900 bg-opacity-20 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="source-account"
              className="mb-1 block text-sm font-medium text-amber-100"
            >
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
              {accounts
                .filter((account) => account.statut === 'approuve')
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.numero_compte} - {account.type_compte} (
                    {new Intl.NumberFormat('fr-MG', {
                      style: 'currency',
                      currency: 'MGA',
                    }).format(account.solde)}
                    )
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="destination-account"
              className="mb-1 block text-sm font-medium text-amber-100"
            >
              Numéro de compte destinataire
            </label>
            <div className="flex">
              <input
                type="text"
                id="destination-account"
                value={destinationAccountNumber}
                onChange={(e) => {
                  setDestinationAccountNumber(e.target.value)
                  setVerifiedAccount(null) // Réinitialiser le compte vérifié si le numéro change
                }}
                className="block w-full rounded-l-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
                placeholder="Ex: 123456789"
                required
              />
              <button
                type="button"
                onClick={verifyAccount}
                disabled={verifying}
                className="flex items-center rounded-r-lg bg-[#294e28] px-4 py-2.5 text-lime-400 transition hover:bg-[#1a3019] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-[#031a09] disabled:opacity-50"
              >
                {verifying ? (
                  <FaSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <FaSearch className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {verifiedAccount && (
            <div className="mb-4 rounded-lg border border-lime-900 bg-[#1a3019] p-4">
              <h3 className="mb-2 font-medium text-lime-400">Informations du destinataire</h3>
              <div className="flex items-center">
                <FaUser className="mr-2 h-5 w-5 text-amber-100" />
                <p className="text-sm text-amber-100">
                  {verifiedAccount.prenom_proprietaire} {verifiedAccount.nom_proprietaire}
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-300">
                Numéro de compte: {verifiedAccount.numero_compte}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-amber-100">
              Montant
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
              placeholder="Montant à envoyer"
              min="1"
              required
              disabled={!verifiedAccount}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-amber-100">
              Description (optionnel)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
              placeholder="Raison du transfert"
              rows={2}
              disabled={!verifiedAccount}
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
              disabled={loading || !verifiedAccount}
              className="flex items-center rounded-lg bg-[#294e28] px-4 py-2 text-sm font-medium text-lime-400 transition hover:bg-[#1a3019] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-[#031a09] disabled:opacity-50"
            >
              {loading ? (
                <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FaExchangeAlt className="mr-2 h-4 w-4" />
              )}
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
