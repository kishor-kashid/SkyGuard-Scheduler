import { PrismaClient, UserRole, TrainingLevel, FlightStatus, FlightType, RescheduleStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.notification.deleteMany();
  await prisma.rescheduleEvent.deleteMany();
  await prisma.weatherCheck.deleteMany();
  await prisma.flightBooking.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.student.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@flightpro.com',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Created admin user');

  // Create Students with different training levels
  const student1User = await prisma.user.create({
    data: {
      email: 'sarah.johnson@example.com',
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      student: {
        create: {
          name: 'Sarah Johnson',
          phone: '+1-555-0101',
          trainingLevel: TrainingLevel.STUDENT_PILOT,
          availability: JSON.stringify({
            weekdays: ['Monday', 'Wednesday', 'Friday'],
            preferredTimes: ['09:00', '14:00'],
          }),
        },
      },
    },
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'michael.chen@example.com',
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      student: {
        create: {
          name: 'Michael Chen',
          phone: '+1-555-0102',
          trainingLevel: TrainingLevel.PRIVATE_PILOT,
          availability: JSON.stringify({
            weekdays: ['Tuesday', 'Thursday', 'Saturday'],
            preferredTimes: ['10:00', '15:00'],
          }),
        },
      },
    },
  });

  const student3User = await prisma.user.create({
    data: {
      email: 'emily.rodriguez@example.com',
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      student: {
        create: {
          name: 'Emily Rodriguez',
          phone: '+1-555-0103',
          trainingLevel: TrainingLevel.INSTRUMENT_RATED,
          availability: JSON.stringify({
            weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            preferredTimes: ['08:00', '12:00', '16:00'],
          }),
        },
      },
    },
  });

  const student4User = await prisma.user.create({
    data: {
      email: 'david.williams@example.com',
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      student: {
        create: {
          name: 'David Williams',
          phone: '+1-555-0104',
          trainingLevel: TrainingLevel.STUDENT_PILOT,
          availability: JSON.stringify({
            weekdays: ['Saturday', 'Sunday'],
            preferredTimes: ['10:00', '14:00'],
          }),
        },
      },
    },
  });

  const student5User = await prisma.user.create({
    data: {
      email: 'lisa.anderson@example.com',
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      student: {
        create: {
          name: 'Lisa Anderson',
          phone: '+1-555-0105',
          trainingLevel: TrainingLevel.PRIVATE_PILOT,
          availability: JSON.stringify({
            weekdays: ['Monday', 'Wednesday', 'Friday'],
            preferredTimes: ['11:00', '15:00'],
          }),
        },
      },
    },
  });

  const student6User = await prisma.user.create({
    data: {
      email: 'robert.taylor@example.com',
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      student: {
        create: {
          name: 'Robert Taylor',
          phone: '+1-555-0106',
          trainingLevel: TrainingLevel.INSTRUMENT_RATED,
          availability: JSON.stringify({
            weekdays: ['Tuesday', 'Thursday', 'Saturday'],
            preferredTimes: ['09:00', '13:00', '17:00'],
          }),
        },
      },
    },
  });

  const student7User = await prisma.user.create({
    data: {
      email: 'jennifer.martinez@example.com',
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      student: {
        create: {
          name: 'Jennifer Martinez',
          phone: '+1-555-0107',
          trainingLevel: TrainingLevel.STUDENT_PILOT,
          availability: JSON.stringify({
            weekdays: ['Monday', 'Tuesday', 'Thursday'],
            preferredTimes: ['08:00', '12:00'],
          }),
        },
      },
    },
  });
  console.log('✅ Created 7 students with different training levels');

  // Get student records
  const students = await prisma.student.findMany({
    include: { user: true },
  });

  // Create Instructors
  const instructor1User = await prisma.user.create({
    data: {
      email: 'john.smith@flightpro.com',
      passwordHash: hashedPassword,
      role: UserRole.INSTRUCTOR,
      instructor: {
        create: {
          name: 'John Smith',
          phone: '+1-555-0201',
          certifications: JSON.stringify([
            'CFI (Certified Flight Instructor)',
            'CFII (Certified Flight Instructor Instrument)',
            'MEI (Multi-Engine Instructor)',
          ]),
        },
      },
    },
  });

  const instructor2User = await prisma.user.create({
    data: {
      email: 'jane.doe@flightpro.com',
      passwordHash: hashedPassword,
      role: UserRole.INSTRUCTOR,
      instructor: {
        create: {
          name: 'Jane Doe',
          phone: '+1-555-0202',
          certifications: JSON.stringify([
            'CFI (Certified Flight Instructor)',
            'CFII (Certified Flight Instructor Instrument)',
          ]),
        },
      },
    },
  });

  const instructor3User = await prisma.user.create({
    data: {
      email: 'robert.wilson@flightpro.com',
      passwordHash: hashedPassword,
      role: UserRole.INSTRUCTOR,
      instructor: {
        create: {
          name: 'Robert Wilson',
          phone: '+1-555-0203',
          certifications: JSON.stringify([
            'CFI (Certified Flight Instructor)',
            'CFII (Certified Flight Instructor Instrument)',
            'MEI (Multi-Engine Instructor)',
            'AGI (Advanced Ground Instructor)',
          ]),
        },
      },
    },
  });
  console.log('✅ Created 3 instructors');

  // Get instructor records
  const instructors = await prisma.instructor.findMany({
    include: { user: true },
  });

  // Create Aircraft
  const aircraft1 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N12345',
      model: 'Cessna 172',
      type: 'Single Engine',
    },
  });

  const aircraft2 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N11111',
      model: 'Cessna 152',
      type: 'Single Engine',
    },
  });

  const aircraft3 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N23456',
      model: 'Cessna 172SP',
      type: 'Single Engine',
    },
  });

  const aircraft4 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N34567',
      model: 'Cessna 172R',
      type: 'Single Engine',
    },
  });

  const aircraft5 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N45678',
      model: 'Cessna 182',
      type: 'Single Engine',
    },
  });

  const aircraft6 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N67890',
      model: 'Piper PA-28',
      type: 'Single Engine',
    },
  });

  const aircraft7 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N78901',
      model: 'Piper PA-28-181',
      type: 'Single Engine',
    },
  });

  const aircraft8 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N89012',
      model: 'Piper PA-28-161',
      type: 'Single Engine',
    },
  });

  const aircraft9 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N90123',
      model: 'Piper PA-44',
      type: 'Multi Engine',
    },
  });

  const aircraft10 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N56789',
      model: 'Diamond DA40',
      type: 'Single Engine',
    },
  });

  const aircraft11 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N01234',
      model: 'Diamond DA20',
      type: 'Single Engine',
    },
  });

  const aircraft12 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N11223',
      model: 'Beechcraft Bonanza',
      type: 'Single Engine',
    },
  });

  const aircraft13 = await prisma.aircraft.create({
    data: {
      tailNumber: 'N22334',
      model: 'Mooney M20',
      type: 'Single Engine',
    },
  });
  console.log('✅ Created 13 aircraft');

  // Create Flight Bookings
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(10, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(15, 0, 0, 0);

  const nextWeek2 = new Date(now);
  nextWeek2.setDate(nextWeek2.getDate() + 8);
  nextWeek2.setHours(9, 0, 0, 0);

  const nextWeek3 = new Date(now);
  nextWeek3.setDate(nextWeek3.getDate() + 9);
  nextWeek3.setHours(13, 0, 0, 0);

  const flight1 = await prisma.flightBooking.create({
    data: {
      studentId: students[0].id, // Sarah - Student Pilot
      instructorId: instructors[0].id,
      aircraftId: aircraft1.id,
      scheduledDate: tomorrow,
      departureLocation: JSON.stringify({
        name: 'KAUS',
        lat: 30.1944,
        lon: -97.6699,
      }),
      destinationLocation: JSON.stringify({
        name: 'KSAT',
        lat: 29.5337,
        lon: -98.4697,
      }),
      status: FlightStatus.CONFIRMED,
      flightType: FlightType.TRAINING,
      notes: 'First solo preparation flight',
    },
  });

  const flight2 = await prisma.flightBooking.create({
    data: {
      studentId: students[1].id, // Michael - Private Pilot
      instructorId: instructors[0].id,
      aircraftId: aircraft2.id,
      scheduledDate: dayAfter,
      departureLocation: JSON.stringify({
        name: 'KAUS',
        lat: 30.1944,
        lon: -97.6699,
      }),
      destinationLocation: JSON.stringify({
        name: 'KDFW',
        lat: 32.8998,
        lon: -97.0403,
      }),
      status: FlightStatus.CONFIRMED,
      flightType: FlightType.CROSS_COUNTRY,
      notes: 'Cross-country training',
    },
  });

  const flight3 = await prisma.flightBooking.create({
    data: {
      studentId: students[2].id, // Emily - Instrument Rated
      instructorId: instructors[1].id,
      aircraftId: aircraft3.id,
      scheduledDate: nextWeek,
      departureLocation: JSON.stringify({
        name: 'KAUS',
        lat: 30.1944,
        lon: -97.6699,
      }),
      destinationLocation: JSON.stringify({
        name: 'KHOU',
        lat: 29.6454,
        lon: -95.2789,
      }),
      status: FlightStatus.CONFIRMED,
      flightType: FlightType.TRAINING,
      notes: 'Instrument approach practice',
    },
  });

  const flight4 = await prisma.flightBooking.create({
    data: {
      studentId: students[0].id, // Sarah - Student Pilot
      instructorId: instructors[1].id,
      aircraftId: aircraft1.id,
      scheduledDate: nextWeek2,
      departureLocation: JSON.stringify({
        name: 'KAUS',
        lat: 30.1944,
        lon: -97.6699,
      }),
      status: FlightStatus.CONFIRMED,
      flightType: FlightType.TRAINING,
      notes: 'Pattern work',
    },
  });

  const flight5 = await prisma.flightBooking.create({
    data: {
      studentId: students[1].id, // Michael - Private Pilot
      instructorId: instructors[0].id,
      aircraftId: aircraft2.id,
      scheduledDate: nextWeek3,
      departureLocation: JSON.stringify({
        name: 'KAUS',
        lat: 30.1944,
        lon: -97.6699,
      }),
      destinationLocation: JSON.stringify({
        name: 'KIAH',
        lat: 29.9844,
        lon: -95.3414,
      }),
      status: FlightStatus.CONFIRMED,
      flightType: FlightType.SOLO,
      notes: 'Solo cross-country',
    },
  });
  console.log('✅ Created 5 flight bookings');

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: student1User.id,
      bookingId: flight1.id,
      type: 'FLIGHT_CONFIRMED',
      message: 'Your flight on ' + tomorrow.toLocaleDateString() + ' at 2:00 PM has been confirmed.',
    },
  });

  await prisma.notification.create({
    data: {
      userId: instructor1User.id,
      bookingId: flight1.id,
      type: 'FLIGHT_CONFIRMED',
      message: 'You have been assigned to a flight with Sarah Johnson on ' + tomorrow.toLocaleDateString() + '.',
    },
  });
  console.log('✅ Created sample notifications');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@flightpro.com / password123');
  console.log('Student 1: sarah.johnson@example.com / password123');
  console.log('Student 2: michael.chen@example.com / password123');
  console.log('Student 3: emily.rodriguez@example.com / password123');
  console.log('Student 4: david.williams@example.com / password123');
  console.log('Student 5: lisa.anderson@example.com / password123');
  console.log('Student 6: robert.taylor@example.com / password123');
  console.log('Student 7: jennifer.martinez@example.com / password123');
  console.log('Instructor 1: john.smith@flightpro.com / password123');
  console.log('Instructor 2: jane.doe@flightpro.com / password123');
  console.log('Instructor 3: robert.wilson@flightpro.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

