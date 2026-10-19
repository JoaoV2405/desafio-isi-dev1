import { Link, redirect, useNavigate, useRouterState } from '@tanstack/react-router'

export { Link }

export function useAppNavigate() {
  return useNavigate()
}

export function useAppPathname() {
  return useRouterState({ select: (state) => state.location.pathname })
}

export function useAppSearchString() {
  return useRouterState({ select: (state) => state.location.searchStr })
}

export function redirectTo(to: string) {
  return redirect({ to })
}