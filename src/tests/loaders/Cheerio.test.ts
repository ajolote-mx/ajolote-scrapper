import axios from 'axios'

import Cheerio from '../../loaders/CheerioLoader'
import { IProxy } from '../../types'

jest.mock('axios')

describe('Cheerio Loader', () => {
  describe('Load Function', () => {
    it('Load', async () => {
      const url = 'foo.com'
      const dummyHTML = '<div class="foo" id="foo"></div>'
      axios.request = jest.fn().mockResolvedValueOnce({ data: dummyHTML })
      const loader = new Cheerio()

      await expect(loader.load(url)).resolves.toBeTruthy()
      expect(axios.request).toHaveBeenCalledWith({
        url,
        headers: expect.any(Object),
        timeout: expect.any(Number)
      })
    })

    it('Including options', async () => {
      const url = 'foo.com'
      const options = { foo: 1 }
      const dummyHTML = '<div class="foo" id="foo"></div>'
      axios.request = jest.fn().mockResolvedValueOnce({ data: dummyHTML })
      const loader = new Cheerio()

      await expect(loader.load(url, options)).resolves.toBeTruthy()
      expect(axios.request).toHaveBeenCalledWith({ ...options, url })
    })

    describe('Proxy', () => {
      function mockProxy () {
        const proxyFunctions = {
          user: '',
          password: '',
          port: 8080,
          host: '',
          getHttpsProxyAgentWithSession: jest.fn(),
          getHttpsProxyAgent: jest.fn(),
          getCredentials: jest.fn(),
          getCredentialsWithSession: jest.fn()
        }
        const Proxy = jest.fn<IProxy, []>(() => proxyFunctions)
        return { Proxy, proxyFunctions }
      }

      it('Proxy', async () => {
        const url = 'foo.com'
        const options = { foo: 1 }
        const dummyHTML = '<div class="foo" id="foo"></div>'
        axios.request = jest.fn().mockResolvedValueOnce({ data: dummyHTML })

        const { Proxy, proxyFunctions } = mockProxy()
        const proxy = new Proxy()

        const loader = new Cheerio({ proxy: true }, proxy)

        await expect(loader.load(url, options)).resolves.toBeTruthy()
        expect(proxyFunctions.getHttpsProxyAgent).toHaveBeenCalled()
        expect(axios.request).toHaveBeenCalledWith({ ...options, url })
      })

      it('Proxy With Session', async () => {
        const url = 'foo.com'
        const options = { foo: 1 }
        const dummyHTML = '<div class="foo" id="foo"></div>'
        axios.request = jest.fn().mockResolvedValueOnce({ data: dummyHTML })

        const { Proxy, proxyFunctions } = mockProxy()
        const proxy = new Proxy()

        const loader = new Cheerio({ proxy: true, useRandomSession: true }, proxy)

        await expect(loader.load(url, options)).resolves.toBeTruthy()
        expect(proxyFunctions.getHttpsProxyAgentWithSession).toHaveBeenCalled()
        expect(axios.request).toHaveBeenCalledWith({ ...options, url })
      })
    })
  })
})
