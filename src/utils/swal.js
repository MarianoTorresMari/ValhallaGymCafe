import Swal from 'sweetalert2'

export const swal = Swal.mixin({
  background: '#18181b',
  color: '#fbbf24',
  confirmButtonColor: '#d97706',
  cancelButtonColor: '#3f3f46',
  iconColor: '#f59e0b',
  customClass: {
    popup: 'border border-amber-800/50 rounded-2xl',
    confirmButton: 'rounded-xl font-bold px-6 py-3',
    cancelButton: 'rounded-xl font-bold px-6 py-3',
  }
})

export default swal
