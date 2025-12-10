export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { barn: { wood:'#6d4c3d', iron:'#8d8f91', rust:'#b04a2b', straw:'#d1b48c', parchment:'#f6f0e6' } },
      borderRadius: { plank: '1.25rem' },
      boxShadow: { rivet: 'inset 0 0 0 2px rgba(0,0,0,.35), 0 8px 18px rgba(0,0,0,.25)' }
    }
  },
  plugins: []
}
