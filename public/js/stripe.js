import axios from 'axios'
import showAlert from './alert'
const bookBtn = document.querySelector('#book-tour')

const stripe = Stripe
  ? Stripe(
      'pk_test_51IJhl0F5NUoFgs81W0nar8kX8M8rK42kkczl0W75HH9OGAgDBf8rNAFK8PToVzcLL1YlJ14kK1yQVofdACakEFJj00rVfTUcDw'
    )
  : ''
 
export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    })
  } catch (err) {
    console.error(err)
    showAlert('error', err)
  }
}
