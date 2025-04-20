function Home() {
  return (
    <div>
      <h1
        className={
          'tracking-[0.6rem ] text-center text-xl font-bold ' +
          'text-[#294e28] md:text-4xl md:tracking-[1.2rem]'
        }
      >
        BIENVENUE SUR MY BANK
      </h1>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i: number) => (
          <img
            key={i}
            src={`home/home-${i}.jpg`}
            alt={`Image ${i}`}
            className={`h-auto w-[90%] rounded-full shadow-md ${i % 2 === 0 ? 'mt-10' : 'mb-10'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Home
