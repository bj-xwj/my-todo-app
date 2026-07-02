'use client'

import { useState, useEffect } from 'react'
import { supabase } from '/root/.openclaw/workspace/src/lib/supabase/client'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // 从 todos 表获取数据
        const { data: tableData, error: fetchError } = await supabase
          .from('todos') // 使用 todos 表
          .select('*')
          .limit(10)

        if (fetchError) {
          setError(fetchError.message)
        } else {
          setData(tableData || [])
        }
      } catch (err) {
        setError('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Next.js + Supabase
        </h2>
        <p className="text-lg text-gray-600">
          This is a starter template with Supabase integration pre-configured.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Supabase Data</h3>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-700">Error: {error}</p>
            <p className="text-sm text-red-600 mt-2">
              Make sure your Supabase table exists and has public access enabled.
            </p>
          </div>
        ) : (
          <div>
            {data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(data[0]).map((key) => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, idx) => (
                          <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No data found in your Supabase table.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Make sure your 'todos' table has data and public access enabled.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Next.js Features</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• App Router</li>
            <li>• Server Components</li>
            <li>• TypeScript Support</li>
            <li>• Tailwind CSS</li>
          </ul>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Supabase Integration</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Pre-configured Client</li>
            <li>• Environment Variables</li>
            <li>• Data Fetching Hooks</li>
            <li>• Error Handling</li>
          </ul>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">Next Steps</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Update table name</li>
            <li>• Add authentication</li>
            <li>• Create API routes</li>
            <li>• Deploy to Vercel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}