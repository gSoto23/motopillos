const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const masterEmail = 'motopillos@gmail.com';
  
  const existing = await prisma.user.findUnique({ where: { email: masterEmail } });
  
  if (!existing) {
    const hashedPassword = await bcrypt.hash('motopillosadmin', 10);
    await prisma.user.create({
      data: {
        email: masterEmail,
        password: hashedPassword,
        name: 'Motopillos Master',
        role: 'MASTER_ADMIN'
      }
    });
    console.log('Master admin created successfully.');
  } else {
    console.log('Master admin already exists.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
