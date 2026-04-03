import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import packageJson from '../../../../package.json';

export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: 'ok' | 'failed' | 'degraded';
    redis: 'ok' | 'failed' | 'not_configured';
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  errors?: string[];
}

async function pingDatabase() {
  await connectDB();
  const mongoose = await import('mongoose');
  if (!mongoose.connection.db) {
    throw new Error('Database connection is not initialized');
  }

  await mongoose.connection.db.admin().ping();
}

export async function GET() {
  const startTime = Date.now();
  const errors: string[] = [];

  const health: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: packageJson.version,
    checks: {
      database: 'ok',
      redis: 'not_configured',
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    },
  };

  try {
    await pingDatabase();
  } catch (error) {
    health.checks.database = 'failed';
    health.status = 'unhealthy';
    errors.push(`Database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const memUsage = process.memoryUsage();
  health.checks.memory = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024),
    total: Math.round(memUsage.heapTotal / 1024 / 1024),
    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
  };

  if (health.checks.memory.percentage > 90) {
    health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
    errors.push('Memory usage critical (>90%)');
  }

  if (errors.length > 0) {
    health.errors = errors;
  }

  const responseTime = Date.now() - startTime;
  const statusCode = health.status === 'unhealthy' ? 503 : 200;

  return NextResponse.json(
    {
      ...health,
      responseTime: `${responseTime}ms`,
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

export async function HEAD() {
  try {
    await pingDatabase();
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
