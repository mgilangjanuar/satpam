import { CreateCredentialForm } from '@/components/dashboard/createCredential'
import { useForm } from '@mantine/form'

export default function useCreateCredential() {

  const form = useForm<CreateCredentialForm>({
    initialValues: {
      url: '',
      passwordId: '',
      username: '',
      password: '',
      authenticatorId: '',
      name: '',
      secret: '',
      digits: 6,
      period: 30,
      algorithm: 'SHA-1'
    }
  })

  return {
    form
  }
}