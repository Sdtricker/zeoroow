/**
 * CLOUDFLARE WORKERS TELEGRAM API
 * 
 * Optimized for Cloudflare Workers platform
 * Runs on global edge locations - super fast!
 * Deploy instantly with wrangler CLI
 */

// Your Telegram Session Configuration (Same as before)
const TELEGRAM_CONFIG = {
    API_ID: '29657994',
    API_HASH: '85f461c4f637911d79c65da1fc2bdd77',
    SESSION_STRING: 'BQGdvlYADkGWG2g9Eo2pQZdY5Av2YKVnPCeFLv_kXNlQr0lJdNZ6oEMFgYrUyNvGKJtXUVaYmgaJWRKOV9F3CbAfTr-PSdOi0HhwWVRhfmm4K6gGCRe3T0aU-GqQC8J3wgACuDlKGSXgQcAPNV-ZY0ZjS0LTGKwNMyc_aKi9VbqgO-JJLxAWN_3ZGD0E7A8JM0EDqpKPnT8EIhMFtM4PN-IfeTOTVGhC2M5_CGJ2B0EJfpIkz2YE3K0EQGfSL0dH_GW4CqZl8F7gfnPdkAZpOZjgE8qGN8sHgU2kM2o5EKJLHyA',
    PHONE_NUMBER: '+94758926714',
    BOT_USERNAME: '@MYEYEINFO_bot',
    
    // Button mappings (exact Unicode from bot)
    BUTTONS: {
        'number_info': '📱 𝗡𝘂𝗺𝗯𝗲𝗿 𝗜𝗻𝗳𝗼',
        'aadhar': '🆔 𝗔𝗮𝗱𝗵𝗮𝗿 𝗜𝗻𝗳𝗼',
        'ration': '📋 𝗥𝗔𝗧𝗜𝗢𝗡 𝗦𝗘𝗔𝗥𝗖𝗛',
        'vehicle': '🚗 𝗩𝗲𝗵𝗶𝗰𝗹𝗲 𝗜𝗻𝗳𝗼',
        'breach': '🔍 𝗕𝗥𝗘𝗔𝗖𝗛 𝗜𝗡𝗙𝗢',
        'challan': '🚨 𝗖𝗛𝗔𝗟𝗟𝗔𝗡 𝗜𝗡𝗙𝗢',
        'fam': '💳 𝗙𝗔𝗠𝗣𝗔𝗬 𝗜𝗡𝗙𝗢',
        'upi': '💰 𝗨𝗣𝗜 𝗜𝗡𝗙𝗢'
    }
};

/**
 * Cloudflare Workers Telegram Handler
 */
class CloudflareWorkerTelegram {
    constructor() {
        this.botChatId = TELEGRAM_CONFIG.BOT_USERNAME;
        this.sessionToken = this.getSessionToken();
        this.apiUrl = 'https://api.telegram.org/bot';
    }
    
    /**
     * Main search function for Cloudflare Workers
     */
    async performSearch(service, inputValue) {
        try {
            console.log(`🚀 Cloudflare Workers: Starting ${service} search for ${inputValue}`);
            
            // Step 1: Send /start command
            await this.sendMessage('/start');
            await this.wait(2000);
            
            // Step 2: Click service button
            const buttonText = TELEGRAM_CONFIG.BUTTONS[service];
            if (!buttonText) {
                throw new Error('Invalid service type');
            }
            
            await this.sendMessage(buttonText);
            await this.wait(2000);
            
            // Step 3: Send input value
            await this.sendMessage(inputValue);
            await this.wait(5000);
            
            // Step 4: Get search results
            const results = await this.getSearchResults();
            
            return {
                status: 'success',
                service: service,
                input: inputValue,
                response: results,
                timestamp: new Date().toISOString(),
                platform: 'Cloudflare Workers',
                edge_location: 'Global CDN'
            };
            
        } catch (error) {
            console.error('❌ Workers search error:', error);
            return {
                status: 'error',
                message: error.message,
                timestamp: new Date().toISOString(),
                platform: 'Cloudflare Workers'
            };
        }
    }
    
    /**
     * Send message using Cloudflare Workers fetch
     */
    async sendMessage(text) {
        try {
            const url = `${this.apiUrl}${this.sessionToken}/sendMessage`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Cloudflare-Workers-API/1.0'
                },
                body: new URLSearchParams({
                    chat_id: this.botChatId,
                    text: text
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Message sent: ${text.substring(0, 30)}...`);
                return data;
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
        } catch (error) {
            console.error('❌ Send message error:', error);
            throw error;
        }
    }
    
    /**
     * Get search results from bot
     */
    async getSearchResults() {
        try {
            const url = `${this.apiUrl}${this.sessionToken}/getUpdates`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Cloudflare-Workers-API/1.0'
                },
                body: new URLSearchParams({
                    limit: 15,
                    offset: -15
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return this.parseSearchResults(data);
            }
            
            throw new Error('Failed to get bot updates');
            
        } catch (error) {
            console.error('❌ Get results error:', error);
            return 'Error retrieving search results. Please try again.';
        }
    }
    
    /**
     * Parse search results from bot response
     */
    parseSearchResults(data) {
        const resultMessages = [];
        
        if (data.result && Array.isArray(data.result)) {
            // Process messages in reverse order (latest first)
            for (const update of data.result.reverse()) {
                if (update.message && update.message.text) {
                    const text = update.message.text;
                    
                    // Check if this message contains search results
                    if (this.isSearchResult(text)) {
                        resultMessages.push(text);
                        console.log(`📋 Found result: ${text.substring(0, 80)}...`);
                    }
                }
            }
        }
        
        if (resultMessages.length > 0) {
            return resultMessages.join('\n\n');
        }
        
        return 'No search results found. Please try again.';
    }
    
    /**
     * Check if message contains search results
     */
    isSearchResult(text) {
        const indicators = [
            'Number Info Results:',
            'Aadhar Info Results:',
            'Vehicle Info Results:',
            'FamPay Info Results:',
            'UPI Info Results:',
            'Breach Info Results:',
            'Challan Info Results:',
            'Ration Info Results:',
            'Result 1:', 'Result 2:', 'Result 3:',
            '𝗠𝗬 𝗘𝗬𝗘 𝗢𝗦𝗜𝗡𝗧',
            'Credits Used:', 'Remaining Credits:',
            'Showing', 'Found', '🎯',
            'No Information Found', 'No data available'
        ];
        
        return indicators.some(indicator => text.includes(indicator));
    }
    
    /**
     * Get session token for API calls
     */
    getSessionToken() {
        // Create base64 encoded token from session string
        return btoa(TELEGRAM_CONFIG.SESSION_STRING);
    }
    
    /**
     * Wait function using Promise
     */
    async wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}

/**
 * Main Cloudflare Workers Request Handler
 */
async function handleRequest(request) {
    // Add CORS headers for browser requests
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json; charset=UTF-8'
    };
    
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders
        });
    }
    
    try {
        const url = new URL(request.url);
        const path = url.pathname;
        const params = url.searchParams;
        
        // Initialize Telegram handler
        const telegram = new CloudflareWorkerTelegram();
        
        // Route handling
        switch (path) {
            case '/':
                return new Response(JSON.stringify({
                    status: 'active',
                    message: 'Telegram Session API - Cloudflare Workers Version',
                    session_user: TELEGRAM_CONFIG.PHONE_NUMBER,
                    bot_target: TELEGRAM_CONFIG.BOT_USERNAME,
                    version: '3.0.0',
                    platform: 'Cloudflare Workers',
                    edge_location: 'Global CDN Network',
                    performance: 'Ultra Fast ⚡',
                    endpoints: {
                        '/number_info?number=9876543210': 'Phone number search',
                        '/aadhar?number=9876543210': 'Aadhar information',
                        '/vehicle?number=DL01AB1234': 'Vehicle information',
                        '/fam?number=9876543210': 'FamPay information',
                        '/ration?number=9876543210': 'Ration card search',
                        '/breach?email=test@gmail.com': 'Data breach check',
                        '/challan?number=9876543210': 'Traffic challan',
                        '/upi?number=9876543210': 'UPI information'
                    },
                    note: 'Runs on Cloudflare global edge network for maximum speed! 🚀'
                }, null, 2), {
                    status: 200,
                    headers: corsHeaders
                });
                
            case '/number_info':
                const number = params.get('number');
                if (!number) {
                    return new Response(JSON.stringify({
                        status: 'error',
                        message: 'Number parameter required'
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
                const numberResult = await telegram.performSearch('number_info', number);
                return new Response(JSON.stringify(numberResult, null, 2), {
                    status: 200,
                    headers: corsHeaders
                });
                
            case '/aadhar':
                const aadharNumber = params.get('number');
                if (!aadharNumber) {
                    return new Response(JSON.stringify({
                        status: 'error',
                        message: 'Number parameter required'
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
                const aadharResult = await telegram.performSearch('aadhar', aadharNumber);
                return new Response(JSON.stringify(aadharResult, null, 2), {
                    status: 200,
                    headers: corsHeaders
                });
                
            case '/vehicle':
                const vehicleNumber = params.get('number');
                if (!vehicleNumber) {
                    return new Response(JSON.stringify({
                        status: 'error',
                        message: 'Number parameter required'
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
                const vehicleResult = await telegram.performSearch('vehicle', vehicleNumber);
                return new Response(JSON.stringify(vehicleResult, null, 2), {
                    status: 200,
                    headers: corsHeaders
                });
                
            case '/fam':
                const famNumber = params.get('number');
                if (!famNumber) {
                    return new Response(JSON.stringify({
                        status: 'error',
                        message: 'Number parameter required'
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
                const famResult = await telegram.performSearch('fam', famNumber);
                return new Response(JSON.stringify(famResult, null, 2), {
                    status: 200,
                    headers: corsHeaders
                });
                
            case '/ration':
                const rationNumber = params.get('number');
                if (!rationNumber) {
                    return new Response(JSON.stringify({
                        status: 'error',
                        message: 'Number parameter required'
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
                const rationResult = await telegram.performSearch('ration', rationNumber);
                return new Response(JSON.stringify(rationResult, null, 2), {
                    status: 200,
                    headers: corsHeaders
                });
                
            case '/breach':
                const email = params.get('email');
                if (!email) {
                    return new Response(JSON.stringify({
                        status: 'error',
                        message: 'Email parameter required'
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
                const breachResult = await telegram.performSearch('breach', email);
                return new Response(JSON.stringify(breachResult, null, 2), {
                    status: 200,
                    headers: corsHeaders
                });
                
            case '/challan':
                const challanNumber = params.get('number');
                if (!challanNumber) {
                    return new Response(JSON.stringify({
                        status: 'error',
                        message: 'Number parameter required'
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
                const challanResult = await telegram.performSearch('challan', challanNumber);
                return new Response(JSON.stringify(challanResult, null, 2), {
                    status: 200,
                    headers: corsHeaders
                });
                
            case '/upi':
                const upiNumber = params.get('number');
                if (!upiNumber) {
                    return new Response(JSON.stringify({
                        status: 'error',
                        message: 'Number parameter required'
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
                const upiResult = await telegram.performSearch('upi', upiNumber);
                return new Response(JSON.stringify(upiResult, null, 2), {
                    status: 200,
                    headers: corsHeaders
                });
                
            default:
                return new Response(JSON.stringify({
                    status: 'error',
                    message: 'Endpoint not found',
                    available_endpoints: [
                        '/', '/number_info?number=X', '/aadhar?number=X',
                        '/vehicle?number=X', '/fam?number=X', '/ration?number=X',
                        '/breach?email=X', '/challan?number=X', '/upi?number=X'
                    ]
                }), {
                    status: 404,
                    headers: corsHeaders
                });
        }
        
    } catch (error) {
        console.error('❌ Worker error:', error);
        return new Response(JSON.stringify({
            status: 'error',
            message: 'Server error: ' + error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

/**
 * Cloudflare Workers Event Listener
 */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

/**
 * Alternative export for ES modules
 */
export default {
    async fetch(request, env, ctx) {
        return handleRequest(request);
    }
};