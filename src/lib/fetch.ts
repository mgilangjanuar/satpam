class Fetch {
  async get(url: string) {
    const response = await fetch(url, {
      credentials: 'same-origin'
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || data)
    }
    return await response.json()
  }

  async post(url: string, body: any) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
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
      credentials: 'same-origin',
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