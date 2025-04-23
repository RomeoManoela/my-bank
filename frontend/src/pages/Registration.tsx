import { Form, Link, Navigation, useActionData, useNavigation } from 'react-router-dom'
import React, { useState } from 'react'
import { FaEnvelope, FaIdCard, FaImage, FaLock, FaUser } from 'react-icons/fa'

function Registration() {
  const navigation: Navigation = useNavigation()
  const isSubmitting: boolean = navigation.state === 'submitting'
  const actionData = useActionData() as { error?: string }

  const [cinPreview, setCinPreview] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleCinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCinPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordConfirmation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = (document.getElementById('password') as HTMLInputElement).value
    const confirmPassword = e.target.value

    if (password !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
    } else {
      setPasswordError(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#031a09] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-8 rounded-xl border border-lime-900 bg-gray-800 bg-opacity-30 p-8 shadow-lg">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-lime-400">Créer un compte</h2>
          <p className="mt-2 text-sm text-gray-300">
            Rejoignez MyBank et commencez à gérer vos finances en toute sécurité
          </p>
        </div>

        {actionData?.error && (
          <div className="rounded-md bg-red-900 bg-opacity-50 p-4">
            <div className="text-sm text-red-200">{actionData.error}</div>
          </div>
        )}
        <Form
          method="post"
          className="mt-8 space-y-6"
          encType="multipart/form-data"
          onSubmit={(e) => {
            if (passwordError) {
              e.preventDefault()
            }
          }}
        >
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300">
                  Prénom
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-700 bg-gray-800 px-3 text-gray-400">
                    <FaUser className="h-4 w-4" />
                  </span>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    className="block w-full flex-1 rounded-r-md border-gray-700 bg-gray-800 text-white focus:border-lime-500 focus:ring-lime-500 sm:text-sm"
                    placeholder="Prénom"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300">
                  Nom
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-700 bg-gray-800 px-3 text-gray-400">
                    <FaUser className="h-4 w-4" />
                  </span>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    className="block w-full flex-1 rounded-r-md border-gray-700 bg-gray-800 text-white focus:border-lime-500 focus:ring-lime-500 sm:text-sm"
                    placeholder="Nom"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Adresse email
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-700 bg-gray-800 px-3 text-gray-400">
                  <FaEnvelope className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full flex-1 rounded-r-md border-gray-700 bg-gray-800 text-white focus:border-lime-500 focus:ring-lime-500 sm:text-sm"
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Nom d'utilisateur
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-700 bg-gray-800 px-3 text-gray-400">
                  <FaUser className="h-4 w-4" />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full flex-1 rounded-r-md border-gray-700 bg-gray-800 text-white focus:border-lime-500 focus:ring-lime-500 sm:text-sm"
                  placeholder="nom_utilisateur"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-700 bg-gray-800 px-3 text-gray-400">
                  <FaLock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full flex-1 rounded-r-md border-gray-700 bg-gray-800 text-white focus:border-lime-500 focus:ring-lime-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-300">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-700 bg-gray-800 px-3 text-gray-400">
                  <FaLock className="h-4 w-4" />
                </span>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  required
                  onChange={handlePasswordConfirmation}
                  className={`block w-full flex-1 rounded-r-md border-gray-700 bg-gray-800 text-white focus:border-lime-500 focus:ring-lime-500 sm:text-sm ${
                    passwordError ? 'border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
            </div>

            <div>
              <label htmlFor="cin" className="block text-sm font-medium text-gray-300">
                CIN (photo)
              </label>
              <div className="mt-1">
                <div className="flex items-center justify-center">
                  <label
                    htmlFor="cin"
                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-700 bg-gray-800 hover:bg-gray-700"
                  >
                    {cinPreview ? (
                      <img
                        src={cinPreview}
                        alt="CIN preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <>
                        <FaIdCard className="h-10 w-10 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-400">Télécharger CIN</span>
                      </>
                    )}
                    <input
                      id="cin"
                      name="cin"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCinChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-300">
                Photo de profil
              </label>
              <div className="mt-1">
                <div className="flex items-center justify-center">
                  <label
                    htmlFor="photo"
                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-700 bg-gray-800 hover:bg-gray-700"
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Photo preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <>
                        <FaImage className="h-10 w-10 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-400">Télécharger photo</span>
                      </>
                    )}
                    <input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !!passwordError}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-lime-600 px-4 py-2 text-sm font-medium text-white hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:bg-lime-400"
            >
              {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </div>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Vous avez déjà un compte?
            <Link to="/login" className="font-medium text-lime-400 hover:text-lime-500">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Registration
