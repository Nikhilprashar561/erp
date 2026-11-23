'use server';

import { prisma } from '@/lib/prisma';
import {
  CreateEmployeeSchema,
  ToggleAttendanceSchema,
  type CreateEmployeeInput,
  type ToggleAttendanceInput,
} from '@/lib/validations/employee.schema';
import { AttendanceStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getEmployeesAction() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' },
    });

    const totalStaff = employees.length;
    const presentToday = employees.filter((e) => e.attendance === AttendanceStatus.PRESENT).length;
    const onLeave = totalStaff - presentToday;
    const totalPayroll = employees.reduce((sum, e) => sum + Number(e.monthlySalary), 0);

    const formatted = employees.map((e) => ({
      id: e.id,
      name: e.name,
      role: e.role,
      dept: e.department,
      att: e.attendance === AttendanceStatus.PRESENT ? 'present' : 'leave',
      joined: e.joinedYear,
      salary: Number(e.monthlySalary),
      init: e.initials,
    }));

    return {
      success: true,
      data: {
        cards: [
          { label: 'Total Staff', amt: totalStaff.toString(), accent: '#F0F2F4' },
          { label: 'Present Today', amt: presentToday.toString(), accent: '#4ADE80' },
          { label: 'On Leave', amt: onLeave.toString(), accent: '#FFC840' },
          {
            label: 'Monthly Payroll',
            amt:
              totalPayroll >= 100000
                ? `₹ ${(totalPayroll / 100000).toFixed(2)} L`
                : `₹ ${totalPayroll.toLocaleString('en-IN')}`,
            accent: '#C8D0D8',
          },
        ],
        employees: formatted,
      },
    };
  } catch (err: unknown) {
    console.error('Error fetching employees:', err);
    return { success: false, error: 'Failed to fetch employee roster' };
  }
}

export async function createEmployeeAction(input: CreateEmployeeInput) {
  try {
    const validated = CreateEmployeeSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid employee data' };
    }

    const { name, role, department, monthlySalary, joinedYear } = validated.data;
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const employee = await prisma.employee.create({
      data: {
        name,
        role,
        department,
        monthlySalary,
        joinedYear,
        initials,
        attendance: AttendanceStatus.PRESENT,
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        message: `Employee onboarding: ${name} (${role} · ${department})`,
        timeDisplay: 'Just now',
        tagColor: '#60A5FA',
      },
    });

    revalidatePath('/employees');
    return { success: true, data: employee };
  } catch (err: unknown) {
    console.error('Error creating employee:', err);
    return { success: false, error: 'Failed to onboard employee' };
  }
}

export async function toggleAttendanceAction(input: ToggleAttendanceInput) {
  try {
    const validated = ToggleAttendanceSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: 'Invalid attendance update' };
    }

    const { employeeId, attendance } = validated.data;
    await prisma.employee.update({
      where: { id: employeeId },
      data: { attendance: attendance as AttendanceStatus },
    });

    revalidatePath('/employees');
    return { success: true };
  } catch (err: unknown) {
    console.error('Error updating attendance:', err);
    return { success: false, error: 'Failed to update attendance' };
  }
}
