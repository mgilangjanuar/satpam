class Fetch {
  async get(url: string) {
    const response = await fetch(url)
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || data)
    }
    return await response.json()
  }

  async post(url: string, body: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
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

  async patch(url: string, body: any) {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
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

  async delete(url: string) {
    const response = await fetch(url, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || data)
    }
    return await response.json()
  }
}

export const f = new Fetch()