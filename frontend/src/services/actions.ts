import { AxiosResponse } from 'axios'
import api from './api.ts'
import { ActionFunctionArgs, redirect } from 'react-router-dom'

export async function registration_action({ request }: { request: Request }) {
  const formData: FormData = await request.formData()
  const first_mdp: string = formData.get('password') as string
  const second_mdp: string = formData.get('confirm_password') as string

  if (first_mdp !== second_mdp) {
    return { error: 'Les mots de passe ne correspondent pas' }
  }
  formData.delete('confirm_password')
  try {
    const response: AxiosResponse = await api.post('inscription/', formData)
    console.log(response.data)
  } catch (e) {
    console.log(e)
    return { error: 'Une erreur est survenue' }
  }
  return redirect('/login')
}

export async function login_action({ request }: { request: Request }) {
  const formData: FormData = await request.formData()
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Veuillez remplir tous les champs' }
  }

  try {
    const response = await api.post('token/', { username, password })

    // Stocker le token d'accès dans le localStorage
    localStorage.setItem('access_token', response.data.access)
    return redirect('/dashboard')
  } catch (e: any) {
    console.error(e)
    if (e.response?.status === 401) {
      return { error: "Nom d'utilisateur ou mot de passe incorrect" }
    }
    return { error: 'Une erreur est survenue lors de la connexion' }
  }
}

export async function fetch_transactions_action() {
  try {
    const response = await api.get('transactions/')
    return response.data
  } catch (e: any) {
    console.error(e)
    return { error: 'Erreur lors du chargement des transactions' }
  }
}

export async function fetch_accounts_action() {
  try {
    const response = await api.get('comptes/')
    return response.data
  } catch (e: any) {
    console.error(e)
    return { error: 'Erreur lors du chargement des comptes' }
  }
}

export async function create_account_action({ request }: { request: Request }) {
  try {
    const formData = await request.formData()

    // Make sure the Authorization header is included
    console.log(api.defaults.headers.Authorization)
    const response = await api.post('comptes/creer/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (e: any) {
    console.error(e)
    return { error: e.response?.data?.message || 'Erreur lors de la création du compte' }
  }
}

export async function loan_request_action({ request }: { request: Request }) {
  try {
    const formData = await request.formData()

    // Create a proper JSON payload
    const payload = {
      compte: formData.get('compte'),
      montant: parseFloat(formData.get('montant') as string),
      motif: formData.get('motif'),
    }

    console.log('Sending loan request with payload:', payload)

    const response = await api.post('prets/demander/', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    return response.data
  } catch (e: any) {
    console.error('Loan request error:', e.response?.data || e.message)
    return {
      error:
        e.response?.data?.detail ||
        e.response?.data?.motif ||
        e.response?.data?.montant ||
        e.response?.data?.compte ||
        e.response?.data?.message ||
        'Erreur lors de la demande de prêt',
    }
  }
}

export async function mobile_money_transaction_action({ request }: { request: Request }) {
  try {
    const response = await api.post('transactions/mobile-money/', await request.formData())
    return response.data
  } catch (e: any) {
    console.error('Mobile money transaction error:', e)
    if (e.response && e.response.data) {
      return { error: e.response.data.detail || 'Erreur lors de la transaction' }
    }
    return { error: 'Erreur lors de la transaction' }
  }
}

// Action pour vérifier un compte par son numéro
export async function verify_account_action({ request }: ActionFunctionArgs) {
  try {
    const data = await request.json()
    const response = await api.post('/verify-account/', data)
    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error || 'Erreur lors de la vérification du compte' }
    }
    return { error: error.message || 'Erreur lors de la vérification du compte' }
  }
}

// Action pour effectuer un transfert d'argent
export async function transfer_money_action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData()

    // S'assurer que tous les champs requis sont présents
    const compte_source = formData.get('compte_source')
    const compte_destination = formData.get('compte_destination')
    const montant = formData.get('montant')
    const description = formData.get('description') || 'Virement'

    // Vérifier que compte_destination est présent
    if (!compte_destination) {
      console.error('Erreur: compte_destination manquant dans les données du formulaire')
      return { error: 'Compte destinataire requis pour un virement' }
    }

    // Créer l'objet de données à envoyer
    const transferData = {
      compte_source,
      compte_destination,
      montant: parseFloat(montant as string),
      type: 'transfert',
      status: 'en_attente',
      commentaire: description,
    }

    // Log des données envoyées pour le débogage
    console.log('Données envoyées au backend:', transferData)

    const response = await api.post('transactions/create/', transferData)
    return response.data
  } catch (error: any) {
    // Log détaillé de l'erreur
    console.error('Erreur complète:', error)
    console.error('Détails de la réponse:', error.response?.data)

    if (error.response && error.response.data) {
      if (Array.isArray(error.response.data)) {
        return { error: error.response.data.join(', ') }
      }
      return {
        error:
          error.response.data.detail ||
          JSON.stringify(error.response.data) ||
          'Erreur lors du transfert',
      }
    }
    return { error: error.message || 'Erreur lors du transfert' }
  }
}
