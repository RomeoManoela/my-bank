import { Form, Link, Navigation, useActionData, useNavigation } from 'react-router-dom'
import { FaLock, FaUser } from 'react-icons/fa'

function Login() {
  const navigation: Navigation = useNavigation()
  const isSubmitting: boolean = navigation.state === 'submitting'
  const actionData = useActionData() as { error?: string }

  return (
    <div className="min-h-screen bg-[#031a09] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-8 rounded-xl border border-lime-900 bg-gray-800 bg-opacity-30 p-8 shadow-lg">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-lime-400">Connexion</h2>
          <p className="mt-2 text-sm text-gray-300">Accédez à votre compte MyBank</p>
        </div>

        {actionData?.error && (
          <div className="rounded-md bg-red-900 bg-opacity-50 p-4">
            <div className="text-sm text-red-200">{actionData.error}</div>
          </div>
        )}

        <Form method="post" className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
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
                  autoComplete="current-password"
                  required
                  className="block w-full flex-1 rounded-r-md border-gray-700 bg-gray-800 text-white focus:border-lime-500 focus:ring-lime-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-lime-600 px-4 py-2 text-sm font-medium text-white hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:bg-lime-400"
            >
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Vous n'avez pas de compte?{' '}
            <Link to="/register" className="font-medium text-lime-400 hover:text-lime-500">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
