import express from 'express';
import AWS from 'aws-sdk';
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = 3000;

app.post('/executar', async (req, res) => {
  try {
    await run();
    res.send('Execução concluída!');
  } catch (error) {
    console.error('Erro ao executar:', error);
    res.status(500).send('Erro ao executar.');
  }
});

async function fetchData() {
  const token = process.env.TOKEN_DATO;
  const datoUrl = 'https://graphql.datocms.com/';

  const query = `
  query {
    logoMain{
      logoUrl
    }
    about{
      title,
      text,
      imageUp,
      imageLow,
      background,
      backgroundMobile
    },
    sectionProject{
      videoBackground,
      backgroundImg
    },
    allProjects{
      name,
      projectType,
      projectType2,
      streamLogo,
      imageSlider,
      logoSlider,
      textSlider,
      trailerUrl,
      trailerThumb,
      imageMain,
      logoModal,
      textOne,
      textTwo
      positions{
        positionTitle
        names{
          peopleName
        }
      },
      sliderTitle,
      quotationMarks,
      seasons{
         photo{
          photoUrl,
          name,
          subTitle
        }
      }
      assetType1,
      thumbVideo1,
      galleryUrl1,
      assetType2,
      thumbVideo2,
      galleryUrl2,
      assetType3,
      thumbVideo3,
      galleryUrl3,
      assetType4,
      thumbVideo4,
      galleryUrl4,
      assetType5,
      galleryUrl5,
      thumbVideo5,
      assetType6,
      galleryUrl6,
      thumbVideo6,
      assetType7,
      thumbVideo7,
      galleryUrl7,
      thumbVideo8,
      assetType8,
      galleryUrl8,
      deposition{
        name,
        phrase,
        photoUrl
      }
    },
    whoWeAre{
      titlePart1,
      textPart1,
      photoPart1,
      titlePart2,
      textPart2,
      photoPart2,
      team{
        name,
        photo,
        role,
        textOne,
        textTwo
      }
    },
    contact{
      title,
      email,
      number,
      youtube,
      instagram,
      titleDownloads,
      downloads{
        link
        text
      }
      logoClub,
      titleClub,
      linkClub,
      titleSend,
      subtitleSend,
      linkText,
      textClub,
      linkSend,
      termsText,
      policyText,
      titleTerms,
      linkTerms,
      policyLink
    },
    projectFinal{
      storiesLogo,
      storiesTitle,
      images{
        image
      },
      imageThumb1,
      urlVideo1,
      imageThumb2,
      urlVideo2,
      imageThumb3,
      urlVideo3,
      imageThumb4,
      urlVideo4,
      imageThumb5,
      urlVideo5,
      imageThumb6,
      urlVideo6,
      imageThumb7,
      urlVideo7,
      imageThumb8,
      urlVideo8,
      imageThumb9,
      urlVideo9,
      depositions{
        name,
        photoUrl,
        phrase
      }
    },
    footerModal{
      imageBackground,
      imageText,
      linkTerms,
      policyLink
      linkYoutube,
      linkFacebook,
      linkInstagram
    },
    pageFinal{
      imageOne,
      imageTwo,
      videoProject
    }
  }
`

  try {
    const response = await fetch(datoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log(data.data);

    const jsonData = JSON.stringify(data.data);

    console.log(jsonData);

    await fs.promises.mkdir('/tmp', { recursive: true }); // Cria o diretório /tmp se não existir
    await fs.promises.writeFile('/tmp/data.json', jsonData);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function uploadS3() {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.ACESSKEYID,
      secretAccessKey: process.env.SECRETACESSKEY,
      region: process.env.REGION,
    });

    const bucketName = process.env.BUCKETNAME;
    const fileName = 'data.json';

    const file = fs.createReadStream('/tmp/data.json');

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file,
      ACL: 'public-read',
    };

    await s3.upload(params).promise();

    console.log('Upload feito!');
    fs.unlink('/tmp/data.json', (unlinkErr) => {
      if (unlinkErr) {
        console.error('Erro ao excluir o arquivo:', unlinkErr);
      } else {
        console.log('Arquivo temporario excluído com sucesso.');
      }
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function run() {
  try {
    await fetchData();
    await uploadS3();
    console.log('Busca e Upload feitos.');
  } catch (error) {
    console.log('Run error', error);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});