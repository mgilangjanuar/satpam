import { Select } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useEffect, useState } from 'react'
import QrReader from 'react-qr-scanner'

interface ScanQrProps {
  onScan: (value: string) => void,
  onGetDevices?: () => boolean,
  onNoDevices?: () => void
}

export default function ScanQr({ onScan, onGetDevices, onNoDevices }: ScanQrProps) {
  const [camDevices, setCamDevices] = useState<MediaDeviceInfo[]>([])
  const [camDeviceId, setCamDeviceId] = useState<string | null>(null)

  useEffect(() => {
    if (onGetDevices?.()) {
      window.navigator.mediaDevices.enumerateDevices().then(devices => {
        const cams = devices.filter(device => device.kind === 'videoinput' && device.deviceId)
        setCamDevices(cams)
        setCamDeviceId(cams[0]?.deviceId)
        if (!cams.length) {
          onNoDevices?.()
        }
      })
    }
  }, [onGetDevices, onNoDevices])

  return <>
    {camDevices?.length ? <Select
      mb="md"
      data={camDevices.map(c => ({ value: c.deviceId, label: c.label }))}
      value={camDeviceId}
      onChange={setCamDeviceId} /> : <></>}
    <QrReader
      constraints={{ video: camDeviceId ? {
        deviceId: camDeviceId
      } : {
        facingMode: { ideal: 'environment' }
      } }}
      style={{ width: '100%'}}
      onError={e => showNotification({
        title: 'Error',
        message: e.message,
        color: 'red'
      })}
      onScan={async data => {
        if (data?.text) {
          try {
            onScan(data.text)
          } catch (error: any) {
            alert(error.message)
          }
        }
      }} />
  </>
}