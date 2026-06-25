import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const main = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: { password: hashedPassword },
    create: {
      email: 'owner@demo.com',
      password: hashedPassword,
      name: 'Demo Cafe Owner',
      role: 'OWNER',
    },
  });

  const teaOwner = await prisma.user.upsert({
    where: { email: 'owner@teahouse.com' },
    update: { password: hashedPassword },
    create: {
      email: 'owner@teahouse.com',
      password: hashedPassword,
      name: 'Tea House Owner',
      role: 'OWNER',
    },
  });

  const store = await prisma.store.upsert({
    where: { slug: 'demo-cafe' },
    update: { ownerId: owner.id },
    create: {
      name: 'Demo Cafe',
      slug: 'demo-cafe',
      description: 'Quán cà phê demo cho QR Ordering',
      ownerId: owner.id,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { slug: 'tea-house' },
    update: { ownerId: teaOwner.id },
    create: {
      name: 'Tea House',
      slug: 'tea-house',
      description: 'Trà sữa & trà trái cây',
      ownerId: teaOwner.id,
    },
  });

  const seedStore = async (targetStore, categories) => {
    for (const categoryData of categories) {
      const { products, ...categoryFields } = categoryData;

      const category = await prisma.category.upsert({
        where: { id: `${targetStore.id}-${categoryFields.name}` },
        update: categoryFields,
        create: {
          id: `${targetStore.id}-${categoryFields.name}`,
          ...categoryFields,
          storeId: targetStore.id,
        },
      });

      for (const [index, product] of products.entries()) {
        await prisma.product.upsert({
          where: { id: `${category.id}-${product.name}` },
          update: { ...product, sortOrder: index + 1 },
          create: {
            id: `${category.id}-${product.name}`,
            ...product,
            sortOrder: index + 1,
            storeId: targetStore.id,
            categoryId: category.id,
          },
        });
      }
    }
  };

  await seedStore(store, [
    {
      name: 'Cà phê',
      sortOrder: 1,
      products: [
        { name: 'Cà phê đen', price: 25000, description: 'Cà phê đen đậm đà' },
        { name: 'Cà phê sữa', price: 30000, description: 'Cà phê sữa truyền thống' },
        { name: 'Bạc xỉu', price: 32000, description: 'Ngọt nhẹ, béo thơm' },
      ],
    },
    {
      name: 'Trà & Đồ uống',
      sortOrder: 2,
      products: [
        { name: 'Trà đào', price: 35000, description: 'Trà đào cam sả' },
        { name: 'Trà sữa trân châu', price: 40000, description: 'Trân châu dẻo' },
        { name: 'Nước ép cam', price: 38000, description: 'Cam tươi ép' },
      ],
    },
    {
      name: 'Bánh ngọt',
      sortOrder: 3,
      products: [
        { name: 'Bánh croissant', price: 28000, description: 'Bơ Pháp' },
        { name: 'Tiramisu', price: 45000, description: 'Kem mascarpone' },
      ],
    },
  ]);

  await seedStore(store2, [
    {
      name: 'Trà sữa',
      sortOrder: 1,
      products: [
        { name: 'Trà sữa matcha', price: 42000, description: 'Matcha Nhật' },
        { name: 'Hong trà sữa', price: 38000, description: 'Hong trà đài loan' },
      ],
    },
    {
      name: 'Topping',
      sortOrder: 2,
      products: [
        { name: 'Trân châu', price: 8000, description: 'Thêm topping' },
        { name: 'Thạch dừa', price: 8000, description: 'Thêm topping' },
      ],
    },
  ]);

  const seedDrinkOptions = async (targetStore, drinkProductNames) => {
    const groupDefs = [
      {
        id: `${targetStore.id}-size`,
        name: 'Size',
        type: 'SINGLE',
        required: true,
        sortOrder: 1,
        options: [
          { id: `${targetStore.id}-size-s`, name: 'Size S', priceAdjust: 0, isDefault: false, sortOrder: 1 },
          { id: `${targetStore.id}-size-m`, name: 'Size M', priceAdjust: 5000, isDefault: true, sortOrder: 2 },
          { id: `${targetStore.id}-size-l`, name: 'Size L', priceAdjust: 10000, isDefault: false, sortOrder: 3 },
        ],
      },
      {
        id: `${targetStore.id}-sugar`,
        name: 'Đường',
        type: 'SINGLE',
        required: true,
        sortOrder: 2,
        options: [
          { id: `${targetStore.id}-sugar-0`, name: '0% đường', priceAdjust: 0, isDefault: false, sortOrder: 1 },
          { id: `${targetStore.id}-sugar-30`, name: '30% đường', priceAdjust: 0, isDefault: false, sortOrder: 2 },
          { id: `${targetStore.id}-sugar-50`, name: '50% đường', priceAdjust: 0, isDefault: true, sortOrder: 3 },
          { id: `${targetStore.id}-sugar-100`, name: '100% đường', priceAdjust: 0, isDefault: false, sortOrder: 4 },
        ],
      },
      {
        id: `${targetStore.id}-ice`,
        name: 'Đá',
        type: 'SINGLE',
        required: true,
        sortOrder: 3,
        options: [
          { id: `${targetStore.id}-ice-none`, name: 'Không đá', priceAdjust: 0, isDefault: false, sortOrder: 1 },
          { id: `${targetStore.id}-ice-less`, name: 'Ít đá', priceAdjust: 0, isDefault: false, sortOrder: 2 },
          { id: `${targetStore.id}-ice-normal`, name: 'Bình thường', priceAdjust: 0, isDefault: true, sortOrder: 3 },
          { id: `${targetStore.id}-ice-more`, name: 'Nhiều đá', priceAdjust: 0, isDefault: false, sortOrder: 4 },
        ],
      },
      {
        id: `${targetStore.id}-topping`,
        name: 'Topping',
        type: 'MULTIPLE',
        required: false,
        sortOrder: 4,
        options: [
          { id: `${targetStore.id}-top-pearl`, name: 'Trân châu', priceAdjust: 8000, isDefault: false, sortOrder: 1 },
          { id: `${targetStore.id}-top-coconut`, name: 'Thạch dừa', priceAdjust: 8000, isDefault: false, sortOrder: 2 },
          { id: `${targetStore.id}-top-cheese`, name: 'Kem cheese', priceAdjust: 10000, isDefault: false, sortOrder: 3 },
        ],
      },
    ];

    for (const groupDef of groupDefs) {
      const { options, ...groupFields } = groupDef;

      await prisma.productOptionGroup.upsert({
        where: { id: groupDef.id },
        update: groupFields,
        create: {
          ...groupFields,
          storeId: targetStore.id,
        },
      });

      for (const option of options) {
        await prisma.productOption.upsert({
          where: { id: option.id },
          update: {
            name: option.name,
            priceAdjust: option.priceAdjust,
            isDefault: option.isDefault,
            sortOrder: option.sortOrder,
            groupId: groupDef.id,
          },
          create: {
            ...option,
            groupId: groupDef.id,
          },
        });
      }
    }

    for (const productName of drinkProductNames) {
      const product = await prisma.product.findFirst({
        where: { storeId: targetStore.id, name: productName },
      });

      if (!product) continue;

      await prisma.product.update({
        where: { id: product.id },
        data: { hasOptions: true },
      });

      for (const groupDef of groupDefs) {
        await prisma.productOptionAssignment.upsert({
          where: {
            productId_groupId: {
              productId: product.id,
              groupId: groupDef.id,
            },
          },
          update: {},
          create: {
            productId: product.id,
            groupId: groupDef.id,
          },
        });
      }
    }
  };

  await seedDrinkOptions(store, [
    'Cà phê đen',
    'Cà phê sữa',
    'Bạc xỉu',
    'Trà đào',
    'Trà sữa trân châu',
    'Nước ép cam',
  ]);

  await seedDrinkOptions(store2, ['Trà sữa matcha', 'Hong trà sữa']);

  await prisma.store.update({
    where: { id: store.id },
    data: {
      bankName: 'Vietcombank',
      bankAccountNo: '1029384756',
      bankAccountName: 'DEMO CAFE',
      bankQrImage:
        'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Demo-Cafe-Bank-Transfer',
    },
  });

  await prisma.product.updateMany({
    where: {
      storeId: store.id,
      name: { in: ['Cà phê sữa', 'Trà đào', 'Trà sữa trân châu'] },
    },
    data: { isBestSeller: true },
  });

  const coffeeProduct = await prisma.product.findFirst({
    where: { storeId: store.id, name: 'Cà phê đen' },
  });

  if (coffeeProduct) {
    await prisma.order.upsert({
      where: { orderNumber: 'ORD-SEED-001' },
      update: {},
      create: {
        orderNumber: 'ORD-SEED-001',
        status: 'PREPARING',
        tableNumber: 'Bàn 2',
        note: 'Ít đường',
        totalAmount: 50000,
        storeId: store.id,
        items: {
          create: [
            {
              productId: coffeeProduct.id,
              quantity: 2,
              unitPrice: 25000,
              subtotal: 50000,
            },
          ],
        },
      },
    });
  }

  console.log('Seed completed.');
  console.log('Demo Cafe:  owner@demo.com / admin123  →  /store/demo-cafe');
  console.log('Tea House:  owner@teahouse.com / admin123  →  /store/tea-house');
};

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
