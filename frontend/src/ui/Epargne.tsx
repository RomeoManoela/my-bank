function Epargne() {
  return (
    <div>
      <div>
        <h1 className={'mb-3 text-6xl font-bold text-amber-100'}>
          Service d'<span className={'text-lime-400'}>Epargne</span>
        </h1>
      </div>
      <div className={'grid grid-cols-2 gap-6'}>
        <div>
          <h2 className="mb-4 text-2xl font-bold text-amber-100">
            Épargner votre argent en toute sécurité avec MyBank, votre banque en ligne.
          </h2>
          <p className="mb-3 text-white">
            Découvrez nos solutions d'épargne personnalisées avec des taux d'intérêt exceptionnels :
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-lime-900 bg-gray-800 bg-opacity-40 p-4">
              <h3 className="mb-2 text-xl font-semibold text-lime-400">Compte Épargne Premium</h3>
              <ul className="space-y-2 text-white">
                <li className="flex items-center">
                  <span className="mr-2 text-amber-100">✓</span> Taux d'intérêt annuel jusqu'à
                  <span className="font-bold text-lime-400">4,5%</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-amber-100">✓</span> Dépôt minimum de seulement 100 000
                  Ar
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-amber-100">✓</span> Retraits flexibles sans pénalités
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-lime-900 bg-gray-800 bg-opacity-40 p-4">
              <h3 className="mb-2 text-xl font-semibold text-lime-400">Plan Épargne Avenir</h3>
              <ul className="space-y-2 text-white">
                <li className="flex items-center">
                  <span className="mr-2 text-amber-100">✓</span> Taux d'intérêt progressif jusqu'à
                  <span className="font-bold text-lime-400">6,2%</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-amber-100">✓</span> Bonus de fidélité après 12 mois
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-amber-100">✓</span> Protection contre l'inflation
                  garantie
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-4 text-white">
            Commencez dès aujourd'hui et sécurisez votre avenir financier avec MyBank,
            <span className="font-semibold text-lime-400">
              la banque qui fait fructifier votre argent
            </span>
          </p>
        </div>
        <div className={'rounded-3xl bg-gray-700 bg-opacity-30 p-4'}>
          <img src="/service/epargne.jpg" alt="epargne" className={'rounded-3xl'} />
        </div>
      </div>
    </div>
  )
}

export default Epargne
