import { resolve } from 'path'
import * as handler from './handler'

export const setupRoutes = server => {
  // monitoring route
  server.route({
    method: 'GET',
    path: '/probe_status',
    handler() {
      return 'OK'
    },
  })

  // NOTE: this route is basic auth protected, see security.js
  if (process.env.BASIC_USER && process.env.BASIC_PW) {
    server.route({
      method: 'GET',
      path: '/svc_status',
      handler: {
        file: resolve(__dirname, '..', '..', 'logs', 'hapi', 'ops.log'),
      },
      options: {
        auth: 'simple',
      },
    })
  }

  // NOTE: one could also implement a service-status page, eg: https://github.com/opentable/hapi-service-status/blob/master/lib/service.js

  // serves static files from <rootDir>/dist/static
  server.route({
    method: 'GET',
    path: '/static/{version}/{params*}', // version is used as a CACHEBUSTER
    handler: {
      directory: {
        path: resolve(__dirname, '..', '..', 'dist', 'static'),
      },
    },
    options: {
      cache: {
        expiresIn: (process.env.STATIC_CACHE_EXPIRATION_TIME || 60 * 10) * 1000, // in seconds
        privacy: process.env.STATIC_CACHE_PRIVACY || 'private',
      },
    },
  })

  // route every other request to the handleRender
  server.route({
    method: 'GET',
    path: '/{url*}',
    handler() {
      return handler.handleRender()
    },
  })
}
