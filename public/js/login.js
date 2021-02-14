import axios from 'axios'
import showAlert from './alert'

export const login = async (email, password) => {
  try {
    const res = await axios.post('/api/v1/users/login', {
      email,
      password,
    })
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully')
      window.setTimeout(() => {
        location.assign('/')
      }, 1000)
      console.log(res)
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}

export const logout = async () => {
  try {
    const res = await axios.get('/api/v1/users/logout')
    if (res.data.status === 'success') location.reload()
  } catch (err) {
    showAlert('error', 'Error logging out! Try again')
  }
}
