import Image from 'next/image'
import React from 'react'

const BookCoverPage = ({imageUrl}:any) => {
  return (
    <div>
        <Image src={imageUrl} width={500} height={500} alt='cover'/>
    </div>
  )
}

export default BookCoverPage