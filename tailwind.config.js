/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'unli-light': '#CAD2C5',
				'unli-sage': '#84A98C',
				'unli-forest': '#52796F',
				'unli-dark': '#354F52',
				'unli-deep': '#2F3E46'
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif']
			},
			animation: {
				'bounce-slow': 'bounce 6s infinite',
				'fade-in': 'fadeIn 0.8s ease-out forwards',
				'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
				'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
				float: 'float 6s ease-in-out infinite'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				fadeInUp: {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				}
			},
			boxShadow: {
				'3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)'
			},
			backdropBlur: {
				xs: '2px'
			}
		}
	},
	safelist: [
		{
			pattern: /(from|to|via)-unli-(light|sage|forest|dark|deep)/,
			variants: ['hover', 'focus']
		},
		{
			pattern: /bg-gradient-to-(r|l|t|b|tr|tl|br|bl)/
		},
		{
			pattern: /text-unli-(light|sage|forest|dark|deep)/,
			variants: ['hover', 'focus', 'group-hover']
		},
		{
			pattern: /bg-unli-(light|sage|forest|dark|deep)/,
			variants: ['hover', 'focus']
		},
		'from-unli-forest',
		'to-unli-deep',
		'from-unli-sage',
		'to-unli-forest',
		'from-unli-light',
		'to-unli-sage',
		'animate-on-scroll',
		'animate-in',
		'animate-fade-in',
		'animate-bounce-slow',
		'backdrop-blur-md',
		'backdrop-blur-xs'
	]
};
