// What is same-origin policy?
// 同源策略是浏览器的一种安全策略(ps:是浏览器的一种策略)。
// 限制了从本源加载的文档和脚本同别的源的资源进行交互。这是一种隔离潜在恶意文件的安全机制。
// 同源的含义，不同的主机，不同的端口号，不同的协议，都可称为不同的源

// What is cors?
// 跨域资源共享机制。
// 浏览器有同源策略，那么什么情况下可以和别的源的资源进行交互呢？
// 别的源(服务器)通过HTTP头来告知浏览器，可以加载别的源的资源。下面举个例子
// 浏览器从origin-A加载了脚本，脚本要访问origin-B的资源(request)。origin-B会通过http header来告知浏览器，可以安全加载我的资源。

/********************************* */
// What is preflight request?
// 预检请求。在跨域请求中，浏览器针对部分请求（有可能会影响服务器数据的请求），会先向服务器发送一个OPTIONS请求，从而获知服务器是否允许跨域请求。这个OPTIONS请求就叫做预检请求。


// What is simple request?
// 对于那些不需要发送预检请求的请求，称之为简单请求
// 1. method GET、HEAD、POST 方法之一
// 2. header仅限于Accept、Accept-Language、Content-Language、Content-Type、DPR、Downlink、Save-Data、Viewport-Width、With 的子集
// 3. content-type仅限于text/plain、multipart/form-data、application/x-www-form-urlencoded三者之一
// 4. 请求中没有使用ReadableStream对象
// 5. 请求中的任意XMLHttpRequestUpload 对象均没有注册任何事件监听器；


// 服务器端要要做的事情
// 告诉浏览器，我支持哪些域，支持哪些请求方式，支持哪些头
// 这些参数是可配置的
/*
{
    allowOrigin: 'origin1,origin2'                                  // Access-Control-Allow-Origin
    exposeHeaders: 'X-My-Custom-Header,X-Another-Customer-Header',  // Access-Control-Expose-Headers
    maxAge: 1500,                                                   // Access-Control-Max-Age (preflight request)
    credentials: true,                                              // Access-Control-Allow-Credentials 
    allowMethods: 'PUT,GET,POST',                                   // Access-Control-Allow-Methods (preflight request)
    allowHeaders: 'xxx',                                            // Access-Control-Allow-Headers (preflight request)
}
*/

function cors(options) {
    const defOpts = {
        allowOrigin: '*',
        maxAge: 3600
    };
    options = Object.assign({}, defOpts, options);

    return async function(ctx, next) {
        let method = ctx.method;

        if (options.allowOrigin != '*') {
            ctx.set('Vary', 'Origin');
        }

        if (options.exposeHeaders) {
            ctx.set('Access-Control-Expose-Headers', options.exposeHeaders);
        }

        if (options.credentials) {
            ctx.set('Access-Control-Allow-Credentials', options.credentials);
        }

        if (method !== 'OPTIONS') {
            // simple request
            // 直接告诉客户端： Access-Control-Allow-Origin
            ctx.set('Access-Control-Allow-Origin', options.allowOrigin);
            return await next();
        } else {

            // preflight request
            
            if (!ctx.get('Access-Control-Request-Method')) {
                // 跨域请求会带有Access-Control-Request-Method header
                return await next();
            }
            if (options.maxAge) {
                ctx.set('Access-Control-Max-Age', options.maxAge);
            }


            if (options.allowMethods) {
                ctx.set('Access-Control-Allow-Methods', options.allowMethods);
            }

            if (options.allowHeaders) {
                ctx.set('Access-Control-Allow-Headers', options.allowHeaders);
            }

            return await next();
        }
    }
}