/**
 * @Author: Ali
 * @Date:   2018-12-27T09:20:47+01:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-12-27T09:22:28+01:00
 */
 import React from 'react'
 import spinner from './spinner.gif'

 export default () => {
   return (
     <div>
       <img
         src={spinner}
         alt="Loading..."
         style={{ width: '200px', margin: ' 40px auto', display: 'block' }}
       />
     </div>
   )
 }
