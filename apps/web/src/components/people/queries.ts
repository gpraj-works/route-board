import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreateUserInput, UpdateUserInput, UserFilterQuery } from '@whosonsite/shared'
import { createUser, listUsers, updateUser } from './api'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilterQuery) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const
}

export function useUsers(filters?: UserFilterQuery) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => listUsers(filters)
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => updateUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}
