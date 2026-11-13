import { NextResponse, type NextRequest } from 'next/server'
import { mockMe, mockMerchants } from '@/lib/mock/merchants'
import { applyMockState, getMockRun, rejectedRowsCsv, startMockRun, storeUpload } from '@/lib/mock/runs'

// Local stand-in for the Azure web app's /ui/* API. Only serves when NEXT_PUBLIC_USE_MOCK_API=true.
// Remove once the real web app is wired in.

type Ctx = { params: { path: string[] } }

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message, request_id: 'mock' } }, { status })
}

function disabled() {
  return process.env.NEXT_PUBLIC_USE_MOCK_API !== 'true'
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (disabled()) return error(404, 'not_found', 'Not found.')
  const p = params.path

  if (p.join('/') === 'me') return NextResponse.json(mockMe)
  if (p.join('/') === 'merchants') return NextResponse.json({ merchants: applyMockState(mockMerchants) })

  // runs/{runId}
  if (p[0] === 'runs' && p.length === 2) {
    const run = getMockRun(p[1])
    return run ? NextResponse.json(run) : error(404, 'not_found', 'Run not found.')
  }

  // merchants/{id}/uploads/{uploadId}/rejected.csv
  if (p[0] === 'merchants' && p[2] === 'uploads' && p[4] === 'rejected.csv') {
    const csv = rejectedRowsCsv(p[1], p[3])
    return csv === null
      ? error(404, 'not_found', 'Upload not found.')
      : new NextResponse(csv, { headers: { 'Content-Type': 'text/csv' } })
  }

  return error(404, 'not_found', `No mock for /ui/${p.join('/')}.`)
}

export async function POST(req: NextRequest, { params }: Ctx) {
  if (disabled()) return error(404, 'not_found', 'Not found.')
  const p = params.path

  // merchants/{id}/uploads
  if (p[0] === 'merchants' && p[2] === 'uploads' && p.length === 3) {
    const form = await req.formData().catch(() => null)
    const file = form?.get('file')
    if (!(file instanceof File)) return error(422, 'validation_failed', 'No file provided.')
    if (file.size > 5 * 1024 * 1024) return error(413, 'file_too_large', 'File is too large.')
    const parsed = storeUpload(p[1], file.name, await file.text())
    return parsed.ok
      ? NextResponse.json(parsed.result, { status: 201 })
      : error(parsed.status, parsed.code, parsed.message)
  }

  // merchants/{id}/runs
  if (p[0] === 'merchants' && p[2] === 'runs' && p.length === 3) {
    const body = (await req.json().catch(() => ({}))) as { upload_id?: string }
    const started = startMockRun(p[1], body.upload_id)
    if ('error' in started && started.error) return error(started.error.status, started.error.code, started.error.message)
    return NextResponse.json({ run_id: started.runId, status: 'queued' }, { status: 202 })
  }

  return error(404, 'not_found', `No mock for /ui/${p.join('/')}.`)
}
