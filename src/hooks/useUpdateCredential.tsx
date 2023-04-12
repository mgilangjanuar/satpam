import { UpdateURLForm } from '@/components/dashboard/detailsCredential'
import { useForm } from '@mantine/form'

export default function useUpdateCredential() {
  const form = useForm<UpdateURLForm>({
    initialValues: {
      url: ''
    }
  })

  return { form }
}