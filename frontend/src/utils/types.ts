export interface userInfo {
  username: string
  email: string
  first_name: string
  last_name: string
  photo: any
  cin: any
  role?: string
  date_inscription?: string
}

export interface ErrorType {
  message?: string
  error?: string
  data?: string
}

export interface CompteBancaire {
  id: number
  utilisateur: number
  utilisateur_username: string
  numero_compte: string
  type_compte: 'courant' | 'epargne'
  attestation_emploi?: File | null
  solde: number
  date_ouverture: string
  statut: 'en_attente' | 'approuve' | 'rejete'
}

export interface Transaction {
  id: string
  compte_source: number
  compte_destinataire?: number
  type: 'depot' | 'retrait' | 'virement' | 'pret' | 'remboursement'
  montant: number
  date: string
  status: 'succès' | 'en_attente' | 'échec'
  commentaire?: string
  source_numero?: string
  destination_numero?: string
}
