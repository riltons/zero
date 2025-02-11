import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

export function ErrorBoundary() {
  const error = useRouteError()

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#213435' }}>
      <div className="bg-white rounded-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Erro Inesperado'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isRouteErrorResponse(error) 
            ? 'A página que você está procurando não foi encontrada.'
            : 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
        </p>
        <Link 
          to="/" 
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  )
}
