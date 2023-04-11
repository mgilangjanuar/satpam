class Fetch {
  async get(url: string, headers?: Record<string, string>) {
    const response = await fetch(url, {
      headers: headers || {},
      credentials: 'same-origin'
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || data)
    }
    return await response.json()
  }

  async post(url: string, body: any, headers?: Record<string, string>) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        ...headers || {},
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || data)
    }
    return await response.json()
  }

  async patch(url: string, body: any, headers?: Record<string, string>) {
    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        ...headers || {},
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || data)
    }
    return await response.json()
  }

  async delete(url: string, headers?: Record<string, string>) {
    const response = await fetch(url, {
      headers: headers || {},
      method: 'DELETE',
      credentials: 'same-origin',
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || data)
    }
    return await response.json()
  }
}

export const f = new Fetch()