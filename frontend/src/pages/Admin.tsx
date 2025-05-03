import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'

function Admin() {
  const [prets, setPrets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [pretsRes, transactionsRes] = await Promise.all([
          api.get('/prets/'),
          api.get('/transactions/'),
        ])

        setPrets(pretsRes.data.filter((pret) => pret.statut === 'en_attente'))
        setTransactions(
          transactionsRes.data.filter((transaction) => transaction.status === 'en_attente'),
        )
        setLoading(false)
      } catch (err) {
        setError('Erreur lors du chargement des données')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('mg-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approuve':
        return 'bg-green-100 text-green-800'
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejete':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePretAction = async (pretId, action) => {
    try {
      await api.patch(`/prets/${pretId}/approuver/`, {
        statut: action === 'approve' ? 'approuve' : 'rejete',
      })

      toast.success(`Prêt ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`)

      // Mettre à jour la liste des prêts
      setPrets(prets.filter((pret) => pret.id !== pretId))
    } catch (err) {
      toast.error(`Erreur lors de l'action sur le prêt`)
      setError(`Erreur lors de l'action sur le prêt`)
    }
  }

  const handleTransactionAction = async (transactionId, action) => {
    try {
      await api.patch(`/transactions/${transactionId}/approuver/`, {
        statut: action === 'approve' ? 'succès' : 'échec',
      })

      toast.success(`Transaction ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`)

      // Mettre à jour la liste des transactions
      setTransactions(transactions.filter((transaction) => transaction.id !== transactionId))
    } catch (err) {
      toast.error(`Erreur lors de l'action sur la transaction`)
      setError(`Erreur lors de l'action sur la transaction`)
    }
  }

  if (loading) return <div className="p-4">Chargement...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Administration</h1>

      {/* Section des prêts en attente */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Prêts en attente</h2>
        {prets.length === 0 ? (
          <p>Aucun prêt en attente</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-lg bg-gray-800">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Compte</th>
                  <th className="px-4 py-2 text-left">Montant</th>
                  <th className="px-4 py-2 text-left">Date demande</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prets.map((pret) => (
                  <tr key={pret.id} className="border-t border-gray-700">
                    <td className="px-4 py-2">{pret.id}</td>
                    <td className="px-4 py-2">{pret.compte}</td>
                    <td className="px-4 py-2">{formatCurrency(pret.montant)}</td>
                    <td className="px-4 py-2">
                      {new Date(pret.date_demande).toLocaleDateString()}
                    </td>
                    <td className="flex space-x-2 px-4 py-2">
                      <button
                        onClick={() => handlePretAction(pret.id, 'approve')}
                        className="rounded bg-green-600 px-3 py-1 text-sm hover:bg-green-700"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handlePretAction(pret.id, 'reject')}
                        className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
                      >
                        Rejeter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section des virements en attente */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Virements en attente</h2>
        {transactions.length === 0 ? (
          <p>Aucun virement en attente</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-lg bg-gray-800">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">De</th>
                  <th className="px-4 py-2 text-left">Vers</th>
                  <th className="px-4 py-2 text-left">Montant</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-gray-700">
                    <td className="px-4 py-2">{transaction.id}</td>
                    <td className="px-4 py-2">{transaction.compte_source || '-'}</td>
                    <td className="px-4 py-2">{transaction.compte_destination || '-'}</td>
                    <td className="px-4 py-2">{formatCurrency(transaction.montant)}</td>
                    <td className="px-4 py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="flex space-x-2 px-4 py-2">
                      <button
                        onClick={() => handleTransactionAction(transaction.id, 'approve')}
                        className="rounded bg-green-600 px-3 py-1 text-sm hover:bg-green-700"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleTransactionAction(transaction.id, 'reject')}
                        className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
                      >
                        Rejeter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
