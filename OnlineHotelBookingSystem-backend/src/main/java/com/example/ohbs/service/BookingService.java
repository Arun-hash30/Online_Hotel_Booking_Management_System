package com.example.ohbs.service;

import com.example.ohbs.dto.BookingDTO;
import com.example.ohbs.dto.CancellationRequestDTO;
import com.example.ohbs.model.Booking;
import com.example.ohbs.model.Room;
import com.example.ohbs.model.User;
import com.example.ohbs.repository.BookingRepository;
import com.example.ohbs.repository.HotelRepository;
import com.example.ohbs.repository.RoomRepository;
import com.example.ohbs.repository.UserRepository;
import com.example.ohbs.exception.ResourceNotFoundException;
import com.example.ohbs.exception.InvalidBookingException;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;
import java.util.stream.Collectors;

@Service
@Validated
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private EmailServices emailService;

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAllWithDetails()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<BookingDTO> getBookingById(Long id) {
        return bookingRepository.findByIdWithDetails(id)
                .map(this::convertToDTO);
    }

    @Transactional
    public BookingDTO createBooking(@Valid BookingDTO bookingDTO) {
        try {
            validateBookingDates(bookingDTO);

            User user = userRepository.findById(bookingDTO.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + bookingDTO.getUserId()));

            Room room = roomRepository.findById(bookingDTO.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + bookingDTO.getRoomId()));

            boolean isRoomAvailable = checkRoomAvailability(
                    bookingDTO.getRoomId(),
                    bookingDTO.getCheckInDate(),
                    bookingDTO.getCheckOutDate()
            );

            if (!isRoomAvailable) {
                throw new InvalidBookingException(
                        String.format("Room is not available for the selected dates: %s to %s. Please choose different dates.",
                                bookingDTO.getCheckInDate(),
                                bookingDTO.getCheckOutDate())
                );
            }

            if (room.getNumberAvailable() <= 0) {
                throw new InvalidBookingException("Room is fully booked. No available rooms for this type.");
            }

            Booking booking = new Booking();
            booking.setUser(user);
            booking.setRoom(room);
            booking.setCheckInDate(bookingDTO.getCheckInDate());
            booking.setCheckOutDate(bookingDTO.getCheckOutDate());
            booking.setStatus("CONFIRMED");
            booking.setCancellationRequested(false);

            long nights = ChronoUnit.DAYS.between(bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());
            double totalPrice = room.getPricePerNight() * nights;
            booking.setTotalPrice(totalPrice);

            Booking savedBooking = bookingRepository.save(booking);

            // Decrement numberAvailable after successful booking
            room.setNumberAvailable(room.getNumberAvailable() - 1);
            roomRepository.save(room);

            try {
                sendBookingConfirmationEmail(savedBooking);
            } catch (Exception e) {
                System.err.println("Failed to send confirmation email: " + e.getMessage());
            }

            return convertToDTO(savedBooking);

        } catch (ResourceNotFoundException | InvalidBookingException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creating booking: " + e.getMessage(), e);
        }
    }

    @Transactional
    public BookingDTO requestCancellation(CancellationRequestDTO request) {
        Booking booking = bookingRepository.findByIdWithDetails(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new InvalidBookingException("Booking is already cancelled.");
        }

        if (booking.getCancellationRequested()) {
            throw new InvalidBookingException("Cancellation request already submitted and is pending manager approval.");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime checkInDateTime = booking.getCheckInDate().atStartOfDay();
        long hoursUntilCheckIn = ChronoUnit.HOURS.between(now, checkInDateTime);

        if (hoursUntilCheckIn < 24) {
            throw new InvalidBookingException(
                    "Cannot request cancellation within 24 hours of check-in. Please contact the hotel directly.");
        }

        booking.setCancellationRequested(true);
        booking.setCancellationRequestDate(now);
        booking.setCancellationReason(request.getReason());
        booking.setStatus("PENDING_CANCELLATION");

        Booking updatedBooking = bookingRepository.save(booking);

        try {
            sendCancellationRequestEmailToManager(updatedBooking);
        } catch (Exception e) {
            System.err.println("Failed to send cancellation request email to manager: " + e.getMessage());
        }

        try {
            sendCancellationRequestConfirmationEmail(updatedBooking);
        } catch (Exception e) {
            System.err.println("Failed to send cancellation request confirmation to user: " + e.getMessage());
        }

        return convertToDTO(updatedBooking);
    }

    @Transactional
    public BookingDTO approveCancellation(Long bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getCancellationRequested()) {
            throw new InvalidBookingException("No cancellation request found for this booking.");
        }

        booking.setStatus("CANCELLED");
        booking.setCancellationRequested(false);

        Booking updatedBooking = bookingRepository.save(booking);

        // Increment numberAvailable when cancellation is approved — room is freed up
        Room room = booking.getRoom();
        room.setNumberAvailable(room.getNumberAvailable() + 1);
        roomRepository.save(room);

        try {
            sendCancellationApprovalEmail(updatedBooking);
        } catch (Exception e) {
            System.err.println("Failed to send cancellation approval email: " + e.getMessage());
        }

        return convertToDTO(updatedBooking);
    }

    @Transactional
    public BookingDTO rejectCancellation(Long bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getCancellationRequested()) {
            throw new InvalidBookingException("No cancellation request found for this booking.");
        }

        booking.setStatus("CONFIRMED");
        booking.setCancellationRequested(false);
        booking.setCancellationReason(null);

        Booking updatedBooking = bookingRepository.save(booking);

        try {
            sendCancellationRejectionEmail(updatedBooking);
        } catch (Exception e) {
            System.err.println("Failed to send cancellation rejection email: " + e.getMessage());
        }

        return convertToDTO(updatedBooking);
    }

    public List<BookingDTO> getPendingCancellations() {
        return bookingRepository.findPendingCancellationsWithDetails()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO updateBooking(Long id, @Valid BookingDTO bookingDTO) {
        validateBookingDates(bookingDTO);

        Booking existingBooking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                bookingDTO.getRoomId(),
                bookingDTO.getCheckInDate(),
                bookingDTO.getCheckOutDate()
        ).stream()
                .filter(b -> !b.getId().equals(id))
                .collect(Collectors.toList());

        if (!conflictingBookings.isEmpty()) {
            throw new InvalidBookingException("Room is not available for the selected dates for update.");
        }

        User user = userRepository.findById(bookingDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + bookingDTO.getUserId()));

        Room room = roomRepository.findById(bookingDTO.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + bookingDTO.getRoomId()));

        existingBooking.setUser(user);
        existingBooking.setRoom(room);
        existingBooking.setCheckInDate(bookingDTO.getCheckInDate());
        existingBooking.setCheckOutDate(bookingDTO.getCheckOutDate());

        long nights = ChronoUnit.DAYS.between(bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());
        double totalPrice = room.getPricePerNight() * nights;
        existingBooking.setTotalPrice(totalPrice);

        Booking updatedBooking = bookingRepository.save(existingBooking);
        return convertToDTO(updatedBooking);
    }

    public void deleteBooking(Long id) {
        bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        bookingRepository.deleteById(id);
    }

    public List<BookingDTO> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserIdWithDetails(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public boolean checkRoomAvailability(Long roomId, LocalDate checkInDate, LocalDate checkOutDate) {
        List<Booking> conflictingBookings = bookingRepository.findOverlappingBookings(
                roomId, checkInDate, checkOutDate);

        conflictingBookings = conflictingBookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()) && !"PENDING_CANCELLATION".equals(b.getStatus()))
                .collect(Collectors.toList());

        boolean hasConflicts = !conflictingBookings.isEmpty();

        if (hasConflicts) {
            System.out.println("Conflicting bookings found for room " + roomId);
            conflictingBookings.forEach(b ->
                    System.out.println("Conflict: " + b.getCheckInDate() + " to " + b.getCheckOutDate()));
        }

        return !hasConflicts;
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setRoomId(booking.getRoom().getId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setStatus(booking.getStatus());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setCancellationRequested(booking.getCancellationRequested());
        dto.setCancellationReason(booking.getCancellationReason());
        return dto;
    }

    private void validateBookingDates(BookingDTO bookingDTO) {
        LocalDate today = LocalDate.now();

        if (bookingDTO.getCheckInDate() == null || bookingDTO.getCheckOutDate() == null) {
            throw new InvalidBookingException("Check-in and check-out dates are required.");
        }

        if (bookingDTO.getCheckInDate().isBefore(today)) {
            throw new InvalidBookingException("Check-in date cannot be in the past. Today is " + today);
        }

        if (bookingDTO.getCheckInDate().isAfter(bookingDTO.getCheckOutDate())) {
            throw new InvalidBookingException("Check-in date must be before check-out date.");
        }

        if (bookingDTO.getCheckInDate().equals(bookingDTO.getCheckOutDate())) {
            throw new InvalidBookingException("Check-in and check-out dates cannot be the same. Minimum stay is 1 night.");
        }

        long daysBetween = ChronoUnit.DAYS.between(bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());
        if (daysBetween > 30) {
            throw new InvalidBookingException("Maximum booking duration is 30 days.");
        }
    }

    // ── Email Helpers ─────────────────────────────────────────────────────────

    private void sendBookingConfirmationEmail(Booking booking) {
        try {
            User user = booking.getUser();
            Room room = booking.getRoom();

            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                System.err.println("User email is null or empty for user: " + user.getId());
                return;
            }

            String hotelName = getHotelName(room);
            String to = user.getEmail();
            String subject = String.format("Booking Confirmation - %s | Booking ID: #%d", hotelName, booking.getId());

            String roomType = room.getType() != null ? room.getType() : "Standard";
            long numberOfNights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
            String formattedCheckIn = booking.getCheckInDate().format(dateFormatter);
            String formattedCheckOut = booking.getCheckOutDate().format(dateFormatter);

            String htmlContent = readHtmlTemplate("email-templates/booking-confirmation.html");

            if (htmlContent != null && !htmlContent.isEmpty()) {
                htmlContent = htmlContent
                        .replace("{HOTEL_NAME}", hotelName)
                        .replace("{GUEST_NAME}", user.getName())
                        .replace("{BOOKING_ID}", String.valueOf(booking.getId()))
                        .replace("{ROOM_TYPE}", roomType)
                        .replace("{CHECK_IN_DATE}", formattedCheckIn)
                        .replace("{CHECK_OUT_DATE}", formattedCheckOut)
                        .replace("{NUMBER_OF_NIGHTS}", String.valueOf(numberOfNights))
                        .replace("{PRICE_PER_NIGHT}", String.format("%.2f", room.getPricePerNight()))
                        .replace("{TOTAL_PRICE}", String.format("%.2f", booking.getTotalPrice()));

                emailService.sendHtmlEmail(to, subject, htmlContent);
            }

            System.out.println("Booking confirmation email sent to: " + to);

        } catch (Exception e) {
            System.err.println("Error preparing confirmation email: " + e.getMessage());
        }
    }

    private void sendCancellationRequestEmailToManager(Booking booking) {
        try {
            List<User> managers = userRepository.findByRole("HOTELMANAGER");

            if (managers.isEmpty()) {
                System.err.println("No hotel managers found to send cancellation request.");
                return;
            }

            String hotelName = getHotelName(booking.getRoom());
            String subject = String.format("Cancellation Request - %s | Booking ID: #%d", hotelName, booking.getId());

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
            String formattedCheckIn = booking.getCheckInDate().format(dateFormatter);
            String formattedCheckOut = booking.getCheckOutDate().format(dateFormatter);

            for (User manager : managers) {
                String htmlContent = readHtmlTemplate("email-templates/cancellation-request-manager.html");

                if (htmlContent != null && !htmlContent.isEmpty()) {
                    htmlContent = htmlContent
                            .replace("{HOTEL_NAME}", hotelName)
                            .replace("{MANAGER_NAME}", manager.getName())
                            .replace("{GUEST_NAME}", booking.getUser().getName())
                            .replace("{BOOKING_ID}", String.valueOf(booking.getId()))
                            .replace("{ROOM_TYPE}", booking.getRoom().getType())
                            .replace("{CHECK_IN_DATE}", formattedCheckIn)
                            .replace("{CHECK_OUT_DATE}", formattedCheckOut)
                            .replace("{TOTAL_PRICE}", String.format("%.2f", booking.getTotalPrice()))
                            .replace("{CANCELLATION_REASON}", booking.getCancellationReason() != null
                                    ? booking.getCancellationReason() : "Not specified");

                    emailService.sendHtmlEmail(manager.getEmail(), subject, htmlContent);
                    System.out.println("Cancellation request email sent to manager: " + manager.getEmail());
                }
            }

        } catch (Exception e) {
            System.err.println("Error sending cancellation request to managers: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendCancellationRequestConfirmationEmail(Booking booking) {
        try {
            User user = booking.getUser();
            String hotelName = getHotelName(booking.getRoom());
            String subject = String.format("Cancellation Request Submitted - %s | Booking ID: #%d",
                    hotelName, booking.getId());

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
            String formattedCheckIn = booking.getCheckInDate().format(dateFormatter);
            String formattedCheckOut = booking.getCheckOutDate().format(dateFormatter);

            String htmlContent = readHtmlTemplate("email-templates/cancellation-request-user.html");

            if (htmlContent != null && !htmlContent.isEmpty()) {
                htmlContent = htmlContent
                        .replace("{HOTEL_NAME}", hotelName)
                        .replace("{GUEST_NAME}", user.getName())
                        .replace("{BOOKING_ID}", String.valueOf(booking.getId()))
                        .replace("{ROOM_TYPE}", booking.getRoom().getType())
                        .replace("{CHECK_IN_DATE}", formattedCheckIn)
                        .replace("{CHECK_OUT_DATE}", formattedCheckOut)
                        .replace("{TOTAL_PRICE}", String.format("%.2f", booking.getTotalPrice()))
                        .replace("{CANCELLATION_REASON}", booking.getCancellationReason() != null
                                ? booking.getCancellationReason() : "Not specified");

                emailService.sendHtmlEmail(user.getEmail(), subject, htmlContent);
            }

            System.out.println("Cancellation request confirmation sent to user: " + user.getEmail());

        } catch (Exception e) {
            System.err.println("Error sending cancellation request confirmation: " + e.getMessage());
        }
    }

    private void sendCancellationApprovalEmail(Booking booking) {
        try {
            User user = booking.getUser();
            String hotelName = getHotelName(booking.getRoom());
            String subject = String.format("Cancellation Approved - %s | Booking ID: #%d",
                    hotelName, booking.getId());

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
            String formattedCheckIn = booking.getCheckInDate().format(dateFormatter);
            String formattedCheckOut = booking.getCheckOutDate().format(dateFormatter);

            String htmlContent = readHtmlTemplate("email-templates/cancellation-approved.html");

            if (htmlContent != null && !htmlContent.isEmpty()) {
                htmlContent = htmlContent
                        .replace("{HOTEL_NAME}", hotelName)
                        .replace("{GUEST_NAME}", user.getName())
                        .replace("{BOOKING_ID}", String.valueOf(booking.getId()))
                        .replace("{ROOM_TYPE}", booking.getRoom().getType())
                        .replace("{CHECK_IN_DATE}", formattedCheckIn)
                        .replace("{CHECK_OUT_DATE}", formattedCheckOut)
                        .replace("{TOTAL_PRICE}", String.format("%.2f", booking.getTotalPrice()));

                emailService.sendHtmlEmail(user.getEmail(), subject, htmlContent);
            }

            System.out.println("Cancellation approval email sent to user: " + user.getEmail());

        } catch (Exception e) {
            System.err.println("Error sending cancellation approval email: " + e.getMessage());
        }
    }

    private void sendCancellationRejectionEmail(Booking booking) {
        try {
            User user = booking.getUser();
            String hotelName = getHotelName(booking.getRoom());
            String subject = String.format("Cancellation Request Declined - %s | Booking ID: #%d",
                    hotelName, booking.getId());

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
            String formattedCheckIn = booking.getCheckInDate().format(dateFormatter);
            String formattedCheckOut = booking.getCheckOutDate().format(dateFormatter);

            String htmlContent = readHtmlTemplate("email-templates/cancellation-rejected.html");

            if (htmlContent != null && !htmlContent.isEmpty()) {
                htmlContent = htmlContent
                        .replace("{HOTEL_NAME}", hotelName)
                        .replace("{GUEST_NAME}", user.getName())
                        .replace("{BOOKING_ID}", String.valueOf(booking.getId()))
                        .replace("{ROOM_TYPE}", booking.getRoom().getType())
                        .replace("{CHECK_IN_DATE}", formattedCheckIn)
                        .replace("{CHECK_OUT_DATE}", formattedCheckOut)
                        .replace("{TOTAL_PRICE}", String.format("%.2f", booking.getTotalPrice()))
                        .replace("{CANCELLATION_REASON}", booking.getCancellationReason() != null
                                ? booking.getCancellationReason() : "Not specified");

                emailService.sendHtmlEmail(user.getEmail(), subject, htmlContent);
            }

            System.out.println("Cancellation rejection email sent to user: " + user.getEmail());

        } catch (Exception e) {
            System.err.println("Error sending cancellation rejection email: " + e.getMessage());
        }
    }

    private String getHotelName(Room room) {
        if (room.getHotelId() != null) {
            return hotelRepository.findById(room.getHotelId())
                    .map(hotel -> hotel.getName())
                    .orElse("OHBS Grand Hotel");
        }
        return "OHBS Grand Hotel";
    }

    private String readHtmlTemplate(String templatePath) {
        try {
            ClassPathResource resource = new ClassPathResource("static/" + templatePath);
            if (resource.exists()) {
                try (InputStream inputStream = resource.getInputStream();
                     Scanner scanner = new Scanner(inputStream, "UTF-8")) {
                    return scanner.useDelimiter("\\A").next();
                }
            } else {
                System.err.println("Template not found: " + templatePath);
                return null;
            }
        } catch (Exception e) {
            System.err.println("Error reading template: " + e.getMessage());
            return null;
        }
    }
}