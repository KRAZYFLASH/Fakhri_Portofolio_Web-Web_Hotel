import express from 'express'
import { checkAvailabilityAPI, createBooking, getHotelBookings, getUserBookings } from '../controllers/bookingController'
import { protect } from '../middleware/authMiddleware'

const booking = express.Router()

bookingRouter.post('/check-availability', checkAvailabilityAPI)
bookingRouter.post('/book', protect, createBooking)
bookingRouter.get('/user', protect, getUserBookings)
bookingRouter.post('/hotel', protect, getHotelBookings)

export default bookingRouter