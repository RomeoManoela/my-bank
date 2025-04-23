import { NavigateFunction, useNavigate, useRouteError } from 'react-router-dom'
import { ErrorType } from '../utils/types.ts'

function Error() {
  const error = useRouteError() as ErrorType
  const navigate: NavigateFunction = useNavigate()
  return (
    <div>
      <h1>Something went wrong 😢</h1>
      <p>{error.data || error.message}</p>

      <button onClick={() => navigate(-1)}>&larr; Go back</button>
    </div>
  )
}

export default Error
