import React, { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { CompteBancaire } from '../utils/types'

interface MobileMoneyModalProps {
  accounts: CompteBancaire[]
  onClose: () => void
  onSubmit: (data: {
    accountId: string
    amount: string
    transactionType: 'depot' | 'retrait'
    mobileMoneyProvider: 'mvola' | 'orange_money'
    phoneNumber: string
  }) => Promise<void>
}

export default function MobileMoneyModal({ accounts, onClose, onSubmit }: MobileMoneyModalProps) {
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionType, setTransactionType] = useState<'depot' | 'retrait'>('depot')
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'mvola' | 'orange_money'>('mvola')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit({
        accountId,
        amount,
        transactionType,
        mobileMoneyProvider,
        phoneNumber,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-lime-900 bg-[#031a09] shadow-lg">
        <div className="flex items-center justify-between border-b border-lime-900 p-4">
          <h3 className="text-lg font-medium text-lime-400">
            {transactionType === 'depot' ? 'Dépôt' : 'Retrait'} via Mobile Money
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-[#1a3019] hover:text-lime-400"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-900 bg-opacity-50 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-amber-100">
              Type de transaction
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="depot"
                  checked={transactionType === 'depot'}
                  onChange={() => setTransactionType('depot')}
                  className="mr-2 h-4 w-4 text-lime-400 focus:ring-lime-400"
                />
                <span className="text-white">Dépôt</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="retrait"
                  checked={transactionType === 'retrait'}
                  onChange={() => setTransactionType('retrait')}
                  className="mr-2 h-4 w-4 text-lime-400 focus:ring-lime-400"
                />
                <span className="text-white">Retrait</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="account" className="mb-1 block text-sm font-medium text-amber-100">
              Compte bancaire
            </label>
            <select
              id="account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
              required
            >
              <option value="">Sélectionner un compte</option>
              {accounts
                .filter((account) => account.statut === 'approuve')
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.type_compte === 'courant' ? 'Compte Courant' : 'Compte Épargne'} (••••
                    {account.numero_compte.slice(-4)})
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="provider" className="mb-1 block text-sm font-medium text-amber-100">
              Fournisseur Mobile Money
            </label>
            <select
              id="provider"
              value={mobileMoneyProvider}
              onChange={(e) => setMobileMoneyProvider(e.target.value as 'mvola' | 'orange_money')}
              className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
              required
            >
              <option value="mvola">M'vola</option>
              <option value="orange_money">Orange Money</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-amber-100">
              Numéro de téléphone
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="034 XX XXX XX"
              className="block w-full rounded-lg border border-lime-900 bg-gray-800 bg-opacity-50 p-2.5 text-white focus:border-lime-400 focus:ring-lime-400"
              required
            />
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
            <p className="mt-1 text-xs text-gray-400">
              {mobileMoneyProvider === 'mvola'
                ? 'Frais: 0,3% (dépôt) / 0,8% (retrait)'
                : 'Frais: 0,5% (dépôt) / 1% (retrait)'}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-lime-900 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-[#1a3019]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#294e28] px-4 py-2 text-sm font-medium text-lime-400 transition hover:bg-[#1a3019] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-[#031a09] disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
