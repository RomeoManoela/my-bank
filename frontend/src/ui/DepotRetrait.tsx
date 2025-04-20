function DepotRetrait() {
  return (
    <div className={'grid grid-cols-5 gap-6'}>
      <div className={'col-span-2'}>
        <div className={'rounded-2xl bg-gray-700 bg-opacity-30 p-2'}>
          <img src="/service/service-1.jpg" alt="retrait" className={'rounded-2xl'} />
        </div>
        <div className={'mt-8 grid grid-cols-2 gap-2'}>
          <img src="/service/mvola.jpeg" alt="mvola" className={'rounded-2xl'} />
          <img src="/service/orange.png" alt="orange money" className={'rounded-2xl'} />
        </div>
      </div>

      <div className={'col-span-3 ml-5'}>
        <h1 className={'mb-10 text-6xl font-bold text-amber-100'}>Dépôt et Retrait en ligne</h1>
        <p className={'mb-5 text-2xl font-bold text-lime-400'}>
          Vous pouvez effectuer des dépôts et retraits en ligne via votre compte bancaire.
        </p>
        <div className="mt-14 space-y-4">
          <div className="rounded-lg border border-lime-900 p-4">
            <h3 className="mb-2 text-xl font-semibold text-amber-100">Via Mobile Money</h3>
            <p className="text-white">
              Connectez votre compte MyBank avec les services de Mobile Money populaires :
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start text-lime-400">
                <span className="mr-2 mt-1">•</span>
                <div>
                  <span className="font-bold">M'vola</span> - Dépôt et retrait instantané 24/7
                  <ul className="ml-4 mt-1 text-sm text-white">
                    <li>Frais: 0,3% du montant pour les dépôts, 0,8% pour les retraits</li>
                    <li>Limite quotidienne: 15 000 000 Ar</li>
                    <li>Avantage: Traitement prioritaire et support client premium</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start text-lime-400">
                <span className="mr-2 mt-1">•</span>
                <div>
                  <span className="font-bold">Orange Money</span> - Dépôt et retrait instantané 24/7
                  <ul className="ml-4 mt-1 text-sm text-white">
                    <li>Frais: 0,5% du montant pour les dépôts, 1% pour les retraits</li>
                    <li>Limite quotidienne: 20 000 000 Ar</li>
                    <li>Avantage: Disponible dans plus de points de service à travers le pays</li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepotRetrait
