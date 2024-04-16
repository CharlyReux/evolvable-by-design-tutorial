import { useState, useEffect } from 'react'

export default function usePivoData (data:any, mappings:any) {
  const [resolvedData, setResolvedData] = useState({})

  useEffect(() => {
    let mounted = true

    const keysInResult = Object.keys(mappings)
    const promises = Object.values(mappings).map(semanticKey => {
      return data.getOneValue(semanticKey)
    })

    Promise.all(promises)
      .then(values =>
        values.reduce((acc, value, index) => {
          acc[keysInResult[index]] = value
          return acc
        }, {})
      )
      .then(newResolvedData => {
        if (mounted) {
          setResolvedData(newResolvedData)
        }
      })

    return () => {
      mounted = false
    }
  }, [data, mappings])

  return resolvedData
}