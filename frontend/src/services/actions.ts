import { AxiosResponse } from 'axios'
import api from './api.ts'
import { redirect } from 'react-router-dom'

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
