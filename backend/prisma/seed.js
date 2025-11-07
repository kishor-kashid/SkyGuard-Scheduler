"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
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
            role: client_1.UserRole.ADMIN,
        },
    });
    console.log('✅ Created admin user');
    // Create Students with different training levels
    const student1User = await prisma.user.create({
        data: {
            email: 'sarah.johnson@example.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.STUDENT,
            student: {
                create: {
                    name: 'Sarah Johnson',
                    phone: '+1-555-0101',
                    trainingLevel: client_1.TrainingLevel.STUDENT_PILOT,
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
            role: client_1.UserRole.STUDENT,
            student: {
                create: {
                    name: 'Michael Chen',
                    phone: '+1-555-0102',
                    trainingLevel: client_1.TrainingLevel.PRIVATE_PILOT,
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
            role: client_1.UserRole.STUDENT,
            student: {
                create: {
                    name: 'Emily Rodriguez',
                    phone: '+1-555-0103',
                    trainingLevel: client_1.TrainingLevel.INSTRUMENT_RATED,
                    availability: JSON.stringify({
                        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                        preferredTimes: ['08:00', '12:00', '16:00'],
                    }),
                },
            },
        },
    });
    console.log('✅ Created 3 students with different training levels');
    // Get student records
    const students = await prisma.student.findMany({
        include: { user: true },
    });
    // Create Instructors
    const instructor1User = await prisma.user.create({
        data: {
            email: 'john.smith@flightpro.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.INSTRUCTOR,
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
            role: client_1.UserRole.INSTRUCTOR,
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
    console.log('✅ Created 2 instructors');
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
            tailNumber: 'N67890',
            model: 'Cessna 172',
            type: 'Single Engine',
        },
    });
    const aircraft3 = await prisma.aircraft.create({
        data: {
            tailNumber: 'N11111',
            model: 'Piper PA-28',
            type: 'Single Engine',
        },
    });
    console.log('✅ Created 3 aircraft');
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
            status: client_1.FlightStatus.CONFIRMED,
            flightType: client_1.FlightType.TRAINING,
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
            status: client_1.FlightStatus.CONFIRMED,
            flightType: client_1.FlightType.CROSS_COUNTRY,
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
            status: client_1.FlightStatus.CONFIRMED,
            flightType: client_1.FlightType.TRAINING,
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
            status: client_1.FlightStatus.CONFIRMED,
            flightType: client_1.FlightType.TRAINING,
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
            status: client_1.FlightStatus.CONFIRMED,
            flightType: client_1.FlightType.SOLO,
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
    console.log('Instructor 1: john.smith@flightpro.com / password123');
    console.log('Instructor 2: jane.doe@flightpro.com / password123');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map