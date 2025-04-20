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
  const data: { [p: string]: File | string } = Object.fromEntries(formData)
  try {
    const response: AxiosResponse = await api.post('inscription/', data)
    console.log(response.data)
  } catch (e) {
    console.log(e)
    return { error: 'Une erreur est survenue' }
  }
  return redirect('/login')
}
