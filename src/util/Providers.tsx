import {ReactNode} from 'react'
import {AuthProvider} from "../context/AuthContext.tsx";

/**
 * A wrapper component that provides various context providers to all child components.
 * This centralized provider allows different states and functionalities to be
 * accessible throughout the application component tree.
 */
export default function Provider({children}: { children: ReactNode }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    )
}