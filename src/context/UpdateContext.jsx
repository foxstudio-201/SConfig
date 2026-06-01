import { createContext, useContext, useState } from 'react'

const UpdateContext = createContext({ updateInfo: null, setUpdateInfo: () => {} })

export function UpdateProvider({ children, initialUpdateInfo }) {
  const [updateInfo, setUpdateInfo] = useState(initialUpdateInfo ?? null)
  return (
    <UpdateContext.Provider value={{ updateInfo, setUpdateInfo }}>
      {children}
    </UpdateContext.Provider>
  )
}

export function useUpdate() {
  return useContext(UpdateContext)
}
